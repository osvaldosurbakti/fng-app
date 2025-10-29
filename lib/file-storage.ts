import { promises as fs } from 'fs'
import path from 'path'

const dataFile = path.join(process.cwd(), 'data', 'sales.json')

export interface FileSale {
  _id: string
  customer: string
  notes: string
  items: any[]
  totalAmount: number
  itemCount: number
  invoice_number: string
  payment: {
    method: 'CASH' | 'QRIS' | 'TRANSFER';
    status: 'PAID' | 'PARTIAL' | 'UNPAID';
    amountPaid: number;
    remainingAmount: number;
    proofImage?: string;
    receiptNumber: string;
    updatedAt: string;
  };
  sale_date: string
  cashier: string
  createdAt: string
  updatedAt: string
}

async function ensureDataDir() {
  const dataDir = path.dirname(dataFile)
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (error) {
    // Directory already exists
  }
}

export async function readSalesFromFile(): Promise<FileSale[]> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(dataFile, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // Return empty array jika file tidak ada
    return []
  }
}

export async function writeSalesToFile(sales: FileSale[]) {
  await ensureDataDir()
  await fs.writeFile(dataFile, JSON.stringify(sales, null, 2))
}

export async function addSaleToFile(saleData: Omit<FileSale, '_id'>): Promise<FileSale> {
  const sales = await readSalesFromFile()
  const newSale: FileSale = {
    _id: Date.now().toString(),
    ...saleData
  }
  sales.push(newSale)
  await writeSalesToFile(sales)
  return newSale
}

export async function deleteSaleFromFile(id: string): Promise<boolean> {
  const sales = await readSalesFromFile()
  const initialLength = sales.length
  const filteredSales = sales.filter(sale => sale._id !== id)
  
  if (filteredSales.length === initialLength) {
    return false // Tidak ada data yang dihapus
  }
  
  await writeSalesToFile(filteredSales)
  return true
}

export async function updateSaleInFile(id: string, updateData: Partial<FileSale>): Promise<{ matchedCount: number; modifiedCount: number }> {
  try {
    const sales = await readSalesFromFile();
    const saleIndex = sales.findIndex(s => s._id === id);
    
    if (saleIndex === -1) {
      return { matchedCount: 0, modifiedCount: 0 };
    }

    sales[saleIndex] = {
      ...sales[saleIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(
      path.join(process.cwd(), 'data', 'sales.json'),
      JSON.stringify(sales, null, 2)
    );

    return { matchedCount: 1, modifiedCount: 1 };
  } catch (error) {
    console.error('Error updating sale in file:', error);
    throw error;
  }
}