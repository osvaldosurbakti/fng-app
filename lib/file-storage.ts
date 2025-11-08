import { promises as fs } from 'fs'
import path from 'path'
import { Sale, PaymentMethod, PaymentStatus } from '@/types/sales'

const dataFile = path.join(process.cwd(), 'data', 'sales.json')

// Export Sale type dari types central untuk konsistensi
export type { Sale }

async function ensureDataDir() {
  const dataDir = path.dirname(dataFile)
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (error) {
    // Directory already exists
  }
}

export async function readSalesFromFile(): Promise<Sale[]> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(dataFile, 'utf-8')
    const sales = JSON.parse(data)
    
    // Validasi dan normalisasi data
    return sales.map((sale: any) => ({
      _id: sale._id || sale.id || `temp-${Date.now()}-${Math.random()}`,
      id: sale.id || sale._id,
      customer: sale.customer || sale.customer_name || "Tanpa Nama",
      customer_name: sale.customer_name || sale.customer || "Tanpa Nama",
      customer_phone: sale.customer_phone || "",
      customer_notes: sale.customer_notes || "",
      notes: sale.notes || "",
      items: Array.isArray(sale.items) ? sale.items.map((item: any) => ({
        product: item.product || item.menu || "Unknown Product",
        menu: item.menu || item.product || "Unknown Product",
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        category: item.category || "",
        temperature: item.temperature || "",
        notes: item.notes || "",
        itemTotal: Number(item.itemTotal) || (Number(item.price) || 0) * (Number(item.quantity) || 1)
      })) : [],
      totalAmount: Number(sale.totalAmount) || Number(sale.total) || 0,
      total: Number(sale.total) || Number(sale.totalAmount) || 0,
      itemCount: Number(sale.itemCount) || (Array.isArray(sale.items) ? sale.items.length : 0),
      invoice_number: sale.invoice_number || `INV-${(sale._id || sale.id)?.toString().slice(-6).toUpperCase()}`,
      payment_status: (sale.payment_status || 'UNPAID').toUpperCase() as PaymentStatus,
      payment_method: (sale.payment_method || 'CASH').toUpperCase() as PaymentMethod,
      sale_date: sale.sale_date || sale.createdAt,
      cashier: sale.cashier || 'System',
      createdAt: sale.createdAt || new Date().toISOString(),
      updatedAt: sale.updatedAt || new Date().toISOString(),
      payment: {
        method: (sale.payment?.method || sale.payment_method || 'CASH').toUpperCase() as PaymentMethod,
        status: (sale.payment?.status || sale.payment_status || 'UNPAID').toUpperCase() as PaymentStatus,
        amountPaid: Number(sale.payment?.amountPaid) || 0,
        remainingAmount: Number(sale.payment?.remainingAmount) || (Number(sale.totalAmount) || 0) - (Number(sale.payment?.amountPaid) || 0),
        proofImage: sale.payment?.proofImage || undefined, // ✅ Gunakan undefined, bukan null
        receiptNumber: sale.payment?.receiptNumber || `RCP-${(sale._id || sale.id)?.toString().slice(-6)}`,
        updatedAt: sale.payment?.updatedAt || sale.updatedAt || new Date().toISOString()
      }
    }))
  } catch (error) {
    // Return empty array jika file tidak ada atau error
    console.log('Creating new sales file...')
    return []
  }
}

export async function writeSalesToFile(sales: Sale[]) {
  await ensureDataDir()
  await fs.writeFile(dataFile, JSON.stringify(sales, null, 2))
}

export async function saveSaleToFile(saleData: Sale): Promise<{ insertedId: string }> {
  const sales = await readSalesFromFile()
  
  // Pastikan _id ada
  const saleWithId: Sale = {
    ...saleData,
    _id: saleData._id || Date.now().toString(),
    id: saleData.id || saleData._id
  }
  
  sales.push(saleWithId)
  await writeSalesToFile(sales)
  
  return { insertedId: saleWithId._id }
}

export async function deleteSaleFromFile(id: string): Promise<boolean> {
  const sales = await readSalesFromFile()
  const initialLength = sales.length
  const filteredSales = sales.filter(sale => sale._id !== id && sale.id !== id)
  
  if (filteredSales.length === initialLength) {
    return false // Tidak ada data yang dihapus
  }
  
  await writeSalesToFile(filteredSales)
  return true
}

export async function updateSaleInFile(id: string, updateData: Partial<Sale>): Promise<{ matchedCount: number; modifiedCount: number }> {
  try {
    const sales = await readSalesFromFile()
    const saleIndex = sales.findIndex(s => s._id === id || s.id === id)
    
    if (saleIndex === -1) {
      return { matchedCount: 0, modifiedCount: 0 }
    }

    sales[saleIndex] = {
      ...sales[saleIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
      payment: updateData.payment ? {
        ...sales[saleIndex].payment,
        ...updateData.payment,
        updatedAt: new Date().toISOString()
      } : sales[saleIndex].payment
    }

    await writeSalesToFile(sales)
    return { matchedCount: 1, modifiedCount: 1 }
  } catch (error) {
    console.error('Error updating sale in file:', error)
    throw error
  }
}

// Helper function untuk mencari sale by ID
export async function findSaleById(id: string): Promise<Sale | null> {
  const sales = await readSalesFromFile()
  return sales.find(sale => sale._id === id || sale.id === id) || null
}

// Helper function untuk mendapatkan sales dengan filter
export async function findSales(filter?: {
  status?: string;
  method?: string;
  date?: string;
  customer?: string;
}): Promise<Sale[]> {
  let sales = await readSalesFromFile()
  
  if (filter) {
    sales = sales.filter(sale => {
      const matchesStatus = !filter.status || filter.status === 'all' || 
        sale.payment_status === filter.status || 
        sale.payment?.status === filter.status
      
      const matchesMethod = !filter.method || filter.method === 'all' || 
        sale.payment_method === filter.method || 
        sale.payment?.method === filter.method
      
      const matchesCustomer = !filter.customer || 
        sale.customer.toLowerCase().includes(filter.customer.toLowerCase()) ||
        sale.customer_name?.toLowerCase().includes(filter.customer.toLowerCase())
      
      const matchesDate = !filter.date || 
        (sale.sale_date && sale.sale_date.startsWith(filter.date)) ||
        (sale.createdAt && sale.createdAt.startsWith(filter.date))
      
      return matchesStatus && matchesMethod && matchesCustomer && matchesDate
    })
  }
  
  // Sort by createdAt descending
  return sales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}