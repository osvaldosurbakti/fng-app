// lib/mongodb.ts
import { MongoClient, MongoClientOptions } from 'mongodb'

// Gunakan connection string yang lebih spesifik
const uri = process.env.MONGODB_URI || 'mongodb+srv://osvaldo12:osvaldo12@cluster0.o7kicie.mongodb.net/fng-login?retryWrites=true&w=majority&appName=Cluster0'

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 15000, // Increase timeout
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  retryWrites: true,
  retryReads: true,
  maxIdleTimeMS: 30000,
  minPoolSize: 1,
  ssl: true,
  authSource: 'admin',
  // Tambahan untuk stability
  heartbeatFrequencyMS: 10000,
  maxStalenessSeconds: 90
}

let client: MongoClient
let clientPromise: Promise<MongoClient>
let isConnected = false
let connectionAttempts = 0
const MAX_RETRY_ATTEMPTS = 3

// Function untuk check koneksi health
async function testConnection(client: MongoClient): Promise<boolean> {
  try {
    await client.db('admin').command({ ping: 1 })
    console.log('✅ MongoDB connection test successful')
    return true
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error)
    return false
  }
}

// Function untuk initialize connection dengan retry
async function initializeConnection(): Promise<MongoClient> {
  try {
    console.log(`🔌 Attempting MongoDB connection (attempt ${connectionAttempts + 1})...`)
    connectionAttempts++
    
    client = new MongoClient(uri, options)
    const connectedClient = await client.connect()
    
    isConnected = await testConnection(connectedClient)
    if (isConnected) {
      console.log('✅ MongoDB connected successfully')
      connectionAttempts = 0 // Reset counter on success
      return connectedClient
    } else {
      throw new Error('Connection test failed')
    }
  } catch (error) {
    console.error(`❌ MongoDB connection attempt ${connectionAttempts} failed:`, error)
    
    if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
      console.log(`🔄 Retrying connection in 2 seconds... (${MAX_RETRY_ATTEMPTS - connectionAttempts} attempts left)`)
      await new Promise(resolve => setTimeout(resolve, 2000))
      return initializeConnection()
    } else {
      console.error('❌ All MongoDB connection attempts failed')
      throw error
    }
  }
}

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
    _mongoConnectionStatus?: boolean
  }

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = initializeConnection()
      .then((connectedClient) => {
        isConnected = true
        globalWithMongo._mongoConnectionStatus = true
        return connectedClient
      })
      .catch((error) => {
        console.error('❌ Final MongoDB connection failed:', error)
        isConnected = false
        globalWithMongo._mongoConnectionStatus = false
        throw error
      })
  }
  
  clientPromise = globalWithMongo._mongoClientPromise
  isConnected = globalWithMongo._mongoConnectionStatus || false
} else {
  // Production
  clientPromise = initializeConnection()
    .then((connectedClient) => {
      isConnected = true
      return connectedClient
    })
    .catch((error) => {
      console.error('❌ Final MongoDB connection failed:', error)
      isConnected = false
      throw error
    })
}

// Export functions
export const getMongoClient = () => clientPromise

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

export const getConnectionStatus = (): boolean => isConnected

export const reconnect = async (): Promise<boolean> => {
  try {
    console.log('🔄 Attempting to reconnect to MongoDB...')
    connectionAttempts = 0 // Reset counter
    
    if (process.env.NODE_ENV === 'development') {
      let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>
        _mongoConnectionStatus?: boolean
      }
      
      // Close existing connection jika ada
      if (globalWithMongo._mongoClientPromise) {
        try {
          const oldClient = await globalWithMongo._mongoClientPromise
          await oldClient.close()
        } catch (error) {
          console.log('No existing connection to close')
        }
      }
      
      // Create new connection
      globalWithMongo._mongoClientPromise = initializeConnection()
        .then((connectedClient) => {
          isConnected = true
          globalWithMongo._mongoConnectionStatus = true
          return connectedClient
        })
      
      clientPromise = globalWithMongo._mongoClientPromise
    } else {
      clientPromise = initializeConnection()
        .then((connectedClient) => {
          isConnected = true
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

// Export default untuk kompatibilitas
export default clientPromise