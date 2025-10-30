import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DB_NAME = process.env.DB_NAME || 'fng-app'

let client: MongoClient
let isConnected = false

async function getMongoClient() {
  if (!client || !isConnected) {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    isConnected = true
    console.log('✅ Connected to MongoDB')
  }
  return client
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📨 Received data:', body)

    // Validasi data
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

    // Hitung total amount
    const totalAmount = body.items.reduce((total: number, item: any) => {
      return total + (parseFloat(item.price) * parseInt(item.quantity))
    }, 0)

    console.log('🧮 Calculated total amount:', totalAmount)

    // Data untuk disimpan ke MongoDB
    const saleData = {
      customer: body.customer?.toString().trim() || 'Walk-in Customer',
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
      invoice_number: `INV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 5)}`,
      payment_status: body.payment?.status || 'PAID',
      payment_method: body.payment?.method || 'CASH',
      sale_date: new Date().toISOString(),
      cashier: 'System',
      createdAt: new Date(),
      updatedAt: new Date(),
      payment: {
        method: body.payment?.method || 'CASH',
        status: body.payment?.status || 'PAID',
        amountPaid: parseFloat(body.payment?.amountPaid || totalAmount),
        remainingAmount: totalAmount - (parseFloat(body.payment?.amountPaid || totalAmount)),
        proofImage: body.payment?.proofImage || null,
        receiptNumber: body.payment?.receiptNumber || `RCP-${Date.now().toString().slice(-6)}`,
        updatedAt: new Date()
      }
    }

    console.log('💾 Saving to MongoDB...')

    // Simpan ke MongoDB
    const client = await getMongoClient()
    const db = client.db(DB_NAME)
    const result = await db.collection('sales').insertOne(saleData)

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

export async function GET() {
  try {
    const client = await getMongoClient()
    const db = client.db(DB_NAME)
    
    const salesData = await db.collection('sales')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

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