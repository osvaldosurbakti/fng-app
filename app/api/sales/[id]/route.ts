import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient, checkConnection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { readSalesFromFile, deleteSaleFromFile, updateSaleInFile } from '@/lib/file-storage'

const USE_FILE_STORAGE = process.env.USE_FILE_STORAGE === 'true' || process.env.NODE_ENV === 'development'

// Helper function untuk membuat filter MongoDB yang aman
function createMongoFilter(id: string): any {
  const filters: any[] = []
  
  // Always search by 'id' field
  filters.push({ id: id })
  
  // Handle _id field based on ID type
  if (ObjectId.isValid(id)) {
    // If it's a valid ObjectId, search as ObjectId
    filters.push({ _id: new ObjectId(id) })
  } else {
    // If it's a string ID, search as string
    filters.push({ _id: id })
  }
  
  // Return single filter if only one, otherwise use $or
  return filters.length === 1 ? filters[0] : { $or: filters }
}

// GET /api/sales/[id] - Get specific sale
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    let sale

    if (USE_FILE_STORAGE) {
      console.log('📁 Using file storage for development - GET by ID')
      const sales = await readSalesFromFile()
      sale = sales.find(s => s._id === id || s.id === id)
    } else {
      try {
        const isConnected = await checkConnection()
        if (!isConnected) {
          throw new Error('MongoDB not connected')
        }

        const client = await getMongoClient()
        const db = client.db('fng-app')
        
        // Gunakan filter yang aman
        const filter = createMongoFilter(id)
        sale = await db.collection('sales').findOne(filter)
      } catch (mongoError) {
        console.warn('MongoDB failed, using file storage:', mongoError)
        const sales = await readSalesFromFile()
        sale = sales.find(s => s._id === id || s.id === id)
      }
    }

    if (!sale) {
      return NextResponse.json(
        { success: false, message: 'Data penjualan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: sale })
  } catch (error: any) {
    console.error('Error fetching sale:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server: ' + error.message },
      { status: 500 }
    )
  }
}

// PUT /api/sales/[id] - Update sale
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    console.log(`🔄 Updating sale ${id}:`, body)

    // Validasi data
    if (body.items && (!Array.isArray(body.items) || body.items.length === 0)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Minimal 1 item harus ditambahkan ke pesanan'
      }, { status: 400 })
    }

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    }

    // Update payment data jika ada
    if (body.payment) {
      updateData.payment = {
        ...body.payment,
        updatedAt: new Date().toISOString()
      }
    }

    let result: any

    if (USE_FILE_STORAGE) {
      console.log('📁 Using file storage for development - PUT')
      result = await updateSaleInFile(id, updateData)
    } else {
      try {
        const isConnected = await checkConnection()
        if (!isConnected) throw new Error('MongoDB not connected')

        const client = await getMongoClient()
        const db = client.db('fng-app')
        
        // Gunakan filter yang aman
        const filter = createMongoFilter(id)

        result = await db.collection('sales').updateOne(
          filter,
          { $set: updateData }
        )
      } catch (mongoError) {
        console.warn('MongoDB failed, using file storage:', mongoError)
        result = await updateSaleInFile(id, updateData)
      }
    }

    // Handle result check dengan type safety
    const matchedCount = result.matchedCount || (result.success ? 1 : 0)
    const modifiedCount = result.modifiedCount || (result.success ? 1 : 0)

    if (matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Data penjualan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Data penjualan berhasil diupdate'
    })
  } catch (error: any) {
    console.error('Error updating sale:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server: ' + error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/sales/[id] - Delete sale
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    console.log(`🗑️ Deleting sale ${id}`)

    let result: any

    if (USE_FILE_STORAGE) {
      console.log('📁 Using file storage for development - DELETE')
      const deleted = await deleteSaleFromFile(id)
      if (!deleted) {
        return NextResponse.json(
          { success: false, message: 'Data penjualan tidak ditemukan' },
          { status: 404 }
        )
      }
      result = { deletedCount: 1 }
    } else {
      try {
        const isConnected = await checkConnection()
        if (!isConnected) {
          throw new Error('MongoDB not connected')
        }

        const client = await getMongoClient()
        const db = client.db('fng-app')
        
        // Gunakan filter yang aman
        const filter = createMongoFilter(id)

        result = await db.collection('sales').deleteOne(filter)
      } catch (mongoError) {
        console.warn('MongoDB failed, using file storage:', mongoError)
        const deleted = await deleteSaleFromFile(id)
        if (!deleted) {
          return NextResponse.json(
            { success: false, message: 'Data penjualan tidak ditemukan' },
            { status: 404 }
          )
        }
        result = { deletedCount: 1 }
      }
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Data penjualan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Penjualan berhasil dihapus' 
    })
  } catch (error: any) {
    console.error('Error deleting sale:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server: ' + error.message },
      { status: 500 }
    )
  }
}