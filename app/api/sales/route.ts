import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { readSalesFromFile, saveSaleToFile } from '@/lib/file-storage'

const USE_FILE_STORAGE = process.env.USE_FILE_STORAGE === 'true' || process.env.NODE_ENV === 'development'

// GET /api/sales - Get all sales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Filter parameters
    const status = searchParams.get('status')
    const method = searchParams.get('method')
    const date = searchParams.get('date')
    const customer = searchParams.get('customer')

    let salesData

    if (USE_FILE_STORAGE) {
      console.log('📁 Using file storage for development - GET all sales')
      salesData = await readSalesFromFile()
    } else {
      const client = await getMongoClient()
      const db = client.db('fng-app')
      
      // Build filter object
      const filter: any = {}
      if (status && status !== 'all') filter.payment_status = status
      if (method && method !== 'all') filter.payment_method = method
      if (customer) filter.customer = { $regex: customer, $options: 'i' }
      if (date) {
        const startDate = new Date(date)
        const endDate = new Date(date)
        endDate.setDate(endDate.getDate() + 1)
        filter.createdAt = { $gte: startDate.toISOString(), $lt: endDate.toISOString() }
      }

      salesData = await db.collection('sales')
        .find(filter)
        .sort({ createdAt: -1 })
        .toArray()
    }

    // Apply filters untuk file storage
    if (USE_FILE_STORAGE) {
      salesData = salesData.filter((sale: any) => {
        const matchesStatus = !status || status === 'all' || sale.payment_status === status
        const matchesMethod = !method || method === 'all' || sale.payment_method === method
        const matchesCustomer = !customer || sale.customer.toLowerCase().includes(customer.toLowerCase())
        const matchesDate = !date || sale.createdAt.startsWith(date)
        
        return matchesStatus && matchesMethod && matchesCustomer && matchesDate
      })
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

// POST /api/sales - Create new sale
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📨 Received data:', JSON.stringify(body, null, 2))

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

    // Data untuk disimpan
    const saleData = {
      _id: Date.now().toString(), // Untuk file storage compatibility
      customer: body.customer?.toString().trim() || 'Walk-in Customer',
      customer_name: body.customer_name?.toString().trim() || body.customer?.toString().trim() || 'Walk-in Customer',
      customer_phone: body.customer_phone?.toString().trim() || '',
      customer_notes: body.customer_notes?.toString().trim() || '',
      notes: body.notes?.toString().trim() || '',
      items: body.items.map((item: any) => ({
        product: item.product.toString().trim(),
        menu: item.menu?.toString().trim() || item.product.toString().trim(),
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        category: item.category || '',
        temperature: item.temperature || '',
        notes: item.notes || '',
        itemTotal: parseFloat(item.price) * parseInt(item.quantity)
      })),
      totalAmount: totalAmount,
      total: totalAmount,
      itemCount: body.items.length,
      invoice_number: body.invoice_number || `INV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 5)}`,
      payment_status: body.payment_status || body.payment?.status || 'UNPAID',
      payment_method: body.payment_method || body.payment?.method || 'CASH',
      sale_date: body.sale_date || new Date().toISOString(),
      cashier: body.cashier || 'System',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      payment: {
        method: body.payment?.method || body.payment_method || 'CASH',
        status: body.payment?.status || body.payment_status || 'UNPAID',
        amountPaid: body.payment?.amountPaid || (body.payment_status === 'PAID' ? totalAmount : 0),
        remainingAmount: body.payment?.remainingAmount || (body.payment_status === 'PAID' ? 0 : totalAmount),
        proofImage: body.payment?.proofImage || undefined,
        receiptNumber: body.payment?.receiptNumber || `RCP-${Date.now().toString().slice(-6)}`,
        updatedAt: new Date().toISOString()
      }
    }

    console.log('💾 Saving sale data...')

    let result

    if (USE_FILE_STORAGE) {
      console.log('📁 Using file storage for development - POST')
      result = await saveSaleToFile(saleData)
    } else {
      const client = await getMongoClient()
      const db = client.db('fng-app')
      // Remove _id so MongoDB generates its own ObjectId
      const { _id, ...mongoSaleData } = saleData
      result = await db.collection('sales').insertOne(mongoSaleData)
    }

    console.log('✅ Sale created successfully. ID:', saleData._id)

    return NextResponse.json({ 
      success: true, 
      message: `Penjualan berhasil disimpan! (${body.items.length} item)`,
      data: {
        ...saleData,
        id: saleData._id
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