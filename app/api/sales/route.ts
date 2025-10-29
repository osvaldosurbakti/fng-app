import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient, checkConnection } from '@/lib/mongodb'
import { readSalesFromFile, addSaleToFile, FileSale } from '@/lib/file-storage'

const USE_FILE_STORAGE = process.env.USE_FILE_STORAGE === 'true' || process.env.NODE_ENV === 'development'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📨 Received data:', body)

    // Validasi untuk multiple items
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Minimal 1 item harus ditambahkan ke pesanan'
      }, { status: 400 })
    }

    // Validasi setiap item
    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i]
      
      if (!item.product || !item.quantity || !item.price) {
        return NextResponse.json({ 
          success: false, 
          message: `Item ${i + 1}: Data product, quantity, dan price harus diisi`
        }, { status: 400 })
      }

      const quantity = parseInt(item.quantity)
      const price = parseFloat(item.price)
      
      if (isNaN(quantity) || quantity < 1) {
        return NextResponse.json({ 
          success: false, 
          message: `Item ${i + 1}: Quantity harus angka dan minimal 1`
        }, { status: 400 })
      }

      if (isNaN(price) || price < 0) {
        return NextResponse.json({ 
          success: false, 
          message: `Item ${i + 1}: Price harus angka dan tidak boleh negatif`
        }, { status: 400 })
      }
    }

    // Hitung total amount dari semua items
    const totalAmount = body.items.reduce((total: number, item: any) => {
      return total + (parseFloat(item.price) * parseInt(item.quantity))
    }, 0)

    console.log('🧮 Calculated total amount:', totalAmount)

    // Data untuk disimpan
    const saleData = {
      customer: body.customer?.toString().trim() || '',
      notes: body.notes?.toString().trim() || '',
      items: body.items.map((item: any) => ({
        product: item.product.toString().trim(),
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        category: item.category || '',
        temperature: item.temperature || '',
        notes: item.notes || '',
        itemTotal: parseFloat(item.price) * parseInt(item.quantity)
      })),
      totalAmount: totalAmount,
      itemCount: body.items.length,
      invoice_number: `INV-${Date.now().toString().slice(-6)}`,
      payment_status: 'paid',
      payment_method: 'cash',
      sale_date: new Date().toISOString(),
      cashier: 'System',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      payment: {
        method: body.payment?.method || 'CASH',
        status: body.payment?.status || 'UNPAID',
        amountPaid: parseFloat(body.payment?.amountPaid || 0),
        remainingAmount: totalAmount - (parseFloat(body.payment?.amountPaid || 0)),
        proofImage: body.payment?.proofImage || null,
        receiptNumber: body.payment?.receiptNumber || `RCP-${Date.now().toString().slice(-6)}`,
        updatedAt: new Date().toISOString()
      }
    }

    console.log('💾 Saving sale data:', saleData)

    let result;

    if (USE_FILE_STORAGE) {
      // Gunakan file storage
      console.log('📁 Using file storage for development')
      const savedSale = await addSaleToFile(saleData as any)
      result = { insertedId: savedSale._id }
    } else {
      // Coba MongoDB dulu, fallback ke file storage
      try {
        const isConnected = await checkConnection()
        if (!isConnected) {
          throw new Error('MongoDB not connected')
        }

        const client = await getMongoClient()
        const db = client.db('fng-app')
        result = await db.collection('sales').insertOne(saleData)
      } catch (mongoError) {
        console.warn('MongoDB failed, using file storage:', mongoError)
        const savedSale = await addSaleToFile(saleData as any)
        result = { insertedId: savedSale._id }
      }
    }

    console.log('✅ Sale created successfully. ID:', result.insertedId)

    return NextResponse.json({ 
      success: true, 
      message: `Penjualan berhasil disimpan! (${body.items.length} item)`,
      data: {
        id: result.insertedId,
        ...saleData
      }
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('❌ Error creating sale:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Terjadi kesalahan server: ' + error.message
    }, { status: 500 })
  }
}

// GET method untuk mengambil data sales
export async function GET() {
  try {
    let salesData;

    if (USE_FILE_STORAGE) {
      // Gunakan file storage
      console.log('📁 Using file storage for development')
      salesData = await readSalesFromFile()
    } else {
      // Coba MongoDB dulu, fallback ke file storage
      try {
        const isConnected = await checkConnection()
        if (!isConnected) {
          throw new Error('MongoDB not connected')
        }

        const client = await getMongoClient()
        const db = client.db('fng-app')
        salesData = await db.collection('sales')
          .find({})
          .sort({ createdAt: -1 })
          .toArray()
      } catch (mongoError) {
        console.warn('MongoDB failed, using file storage:', mongoError)
        salesData = await readSalesFromFile()
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      data: salesData 
    })
  } catch (error: any) {
    console.error('Error fetching sales:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Gagal mengambil data penjualan: ' + error.message
    }, { status: 500 })
  }
}