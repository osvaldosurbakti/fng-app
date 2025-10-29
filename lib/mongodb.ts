import { MongoClient, MongoClientOptions } from 'mongodb'

const uri = process.env.MONGODB_URI!

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000, // Increase timeout
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  // Tambahan options untuk stability
  maxIdleTimeMS: 30000,
  minPoolSize: 1,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>
let isConnected = false

// Function untuk check koneksi health
async function testConnection(client: MongoClient): Promise<boolean> {
  try {
    await client.db('admin').command({ ping: 1 })
    return true
  } catch (error) {
    console.error('MongoDB connection test failed:', error)
    return false
  }
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
    _mongoConnectionStatus?: boolean
  }

  if (!globalWithMongo._mongoClientPromise) {
    console.log('🔌 Initializing MongoDB connection...')
    client = new MongoClient(uri, options)
    
    globalWithMongo._mongoClientPromise = client.connect()
      .then(async (connectedClient) => {
        console.log('✅ MongoDB connected successfully')
        isConnected = await testConnection(connectedClient)
        globalWithMongo._mongoConnectionStatus = isConnected
        return connectedClient
      })
      .catch((error) => {
        console.error('❌ MongoDB connection failed:', error)
        isConnected = false
        globalWithMongo._mongoConnectionStatus = false
        throw error
      })
  }
  
  clientPromise = globalWithMongo._mongoClientPromise
  isConnected = globalWithMongo._mongoConnectionStatus || false
} else {
  // In production mode, it's best to not use a global variable.
  console.log('🔌 Initializing MongoDB connection...')
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
    .then(async (connectedClient) => {
      console.log('✅ MongoDB connected successfully')
      isConnected = await testConnection(connectedClient)
      return connectedClient
    })
    .catch((error) => {
      console.error('❌ MongoDB connection failed:', error)
      isConnected = false
      throw error
    })
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export const getMongoClient = () => clientPromise

// Export connection status checker
export const checkConnection = async (): Promise<boolean> => {
  if (!isConnected) {
    return false
  }
  
  try {
    const client = await getMongoClient()
    return await testConnection(client)
  } catch (error) {
    console.error('MongoDB connection check failed:', error)
    isConnected = false
    return false
  }
}

// Export function untuk mendapatkan connection status
export const getConnectionStatus = (): boolean => isConnected

// Export function untuk reconnect manual
export const reconnect = async (): Promise<boolean> => {
  try {
    console.log('🔄 Attempting to reconnect to MongoDB...')
    
    if (process.env.NODE_ENV === 'development') {
      let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>
        _mongoConnectionStatus?: boolean
      }
      
      // Close existing connection jika ada
      if (globalWithMongo._mongoClientPromise) {
        const oldClient = await globalWithMongo._mongoClientPromise
        await oldClient.close()
      }
      
      // Create new connection
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
        .then(async (connectedClient) => {
          console.log('✅ MongoDB reconnected successfully')
          isConnected = await testConnection(connectedClient)
          globalWithMongo._mongoConnectionStatus = isConnected
          return connectedClient
        })
      
      clientPromise = globalWithMongo._mongoClientPromise
    } else {
      // Untuk production, buat connection baru
      client = new MongoClient(uri, options)
      clientPromise = client.connect()
        .then(async (connectedClient) => {
          console.log('✅ MongoDB reconnected successfully')
          isConnected = await testConnection(connectedClient)
          return connectedClient
        })
    }
    
    await clientPromise
    return true
  } catch (error) {
    console.error('❌ MongoDB reconnection failed:', error)
    isConnected = false
    return false
  }
}