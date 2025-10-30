"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MenuSelector from '@/components/sales/MenuSelector'
import OrderList from '@/components/sales/OrderList'
import PaymentSection from '@/components/sales/PaymentSection'
import { OrderItem, PaymentDetails } from '@/types/sales'

export default function CreateSalePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [formData, setFormData] = useState({
    customer: '',
    notes: ''
  })
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)

  const handleAddItem = (newItem: Omit<OrderItem, "id">) => {
    const item: OrderItem = {
      id: Date.now().toString(),
      ...newItem
    }
    setOrderItems([...orderItems, item])
  }

  const handleRemoveItem = (id: string) => {
    setOrderItems(orderItems.filter(item => item.id !== id))
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return
    setOrderItems(orderItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (orderItems.length === 0) {
        alert('Tambahkan minimal 1 item ke pesanan!')
        setLoading(false)
        return
      }

      if (!paymentDetails) {
        alert('Silakan lengkapi informasi pembayaran!')
        setLoading(false)
        return
      }

      const saleData = {
        customer: formData.customer.trim() || 'Walk-in Customer',
        notes: formData.notes.trim(),
        items: orderItems.map(item => ({
          product: item.menu + (item.temperature ? ` (${item.temperature})` : ''),
          quantity: item.quantity,
          price: item.price,
          category: item.category,
          temperature: item.temperature,
          notes: item.notes
        })),
        totalAmount: calculateTotal(),
        payment: paymentDetails
      }

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menyimpan penjualan')
      }

      if (result.success) {
        alert('Penjualan berhasil disimpan!')
        router.push('/dashboard/sales')
      } else {
        throw new Error(result.message || 'Gagal menyimpan penjualan')
      }

    } catch (error: any) {
      console.error('Error creating sale:', error)
      alert(error.message || 'Terjadi kesalahan saat menyimpan penjualan')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setOrderItems([])
    setFormData({ customer: '', notes: '' })
    setPaymentDetails(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Input Penjualan Baru</h1>
              <p className="text-gray-600 mt-1">Lengkapi informasi penjualan di bawah ini</p>
            </div>
            <div className="flex items-center gap-4 mt-4 lg:mt-0">
              <div className="text-sm text-gray-600">
                {orderItems.length > 0 ? (
                  <span className="flex items-center">
                    📋 {orderItems.length} item dalam pesanan
                  </span>
                ) : (
                  <span className="text-yellow-600">⚠️ Belum ada item</span>
                )}
              </div>
              <button
                onClick={() => router.push('/dashboard/sales')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                ← Kembali
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Order Input */}
          <div className="lg:col-span-7 space-y-6">
            {/* Progress Steps */}
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
              <div className={`flex items-center ${orderItems.length === 0 ? 'text-blue-600' : 'text-green-600'}`}>
                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2">
                  1
                </div>
                <span>Pilih Menu</span>
              </div>
              <div className={`h-1 w-12 ${orderItems.length > 0 ? 'bg-green-600' : 'bg-gray-200'}`} />
              <div className={`flex items-center ${paymentDetails ? 'text-green-600' : orderItems.length > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2">
                  2
                </div>
                <span>Pembayaran</span>
              </div>
            </div>

            {/* Menu Selector with Quick Categories */}
            <MenuSelector onAddItem={handleAddItem} />

            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="p-2 bg-blue-100 rounded-lg">👤</span>
                Informasi Pelanggan
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Pelanggan
                  </label>
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) => setFormData({...formData, customer: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan nama pelanggan..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Pesanan
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tambahkan catatan khusus..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <PaymentSection 
              totalAmount={calculateTotal()}
              onPaymentUpdate={setPaymentDetails}
            />
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <OrderList 
                items={orderItems}
                onRemoveItem={handleRemoveItem}
                onUpdateQuantity={handleUpdateQuantity}
              />

              {/* Action Buttons */}
              {orderItems.length > 0 && (
                <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-blue-900">Total Pembayaran:</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          Rp {calculateTotal().toLocaleString('id-ID')}
                        </div>
                        <div className="text-sm text-blue-600">
                          {orderItems.reduce((sum, item) => sum + item.quantity, 0)} items
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmit}
                      disabled={loading || !paymentDetails}
                      className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Menyimpan...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          💾 Simpan Transaksi
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      title="Reset formulir"
                    >
                      🔄
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}