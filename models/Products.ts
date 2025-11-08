import { ObjectId } from 'mongodb'

export interface Product {
  _id?: ObjectId | string
  name: string          // Nama produk
  category: 'minuman' | 'makanan'
  price: number         // Harga jual
  stock: number         // Stok tersedia
  is_available: boolean // Status ketersediaan
  description?: string
  createdAt: Date
  updatedAt: Date
}