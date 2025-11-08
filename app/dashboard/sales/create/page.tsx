'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import MenuSelector from '@/components/sales/MenuSelector'
import OrderList from '@/components/sales/OrderList'
import PaymentSectionCreate from '@/components/sales/PaymentSectionCreate'
import { 
  OrderItem, 
  PaymentDetails, 
  calculateSaleTotal,
  generateReceiptNumber 
} from '@/types/sales'

export default function CreateSalePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [formData, setFormData] = useState({
    customer: '',
    notes: ''
  })
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Calculate total function
  const calculateTotal = useCallback((): number => {
    return calculateSaleTotal(orderItems)
  }, [orderItems])

useEffect(() => {
  if (!paymentDetails && orderItems.length > 0) {
    const total = calculateTotal()
    setPaymentDetails({
      method: 'CASH',
      status: total > 0 ? 'PAID' : 'UNPAID',
      amountPaid: total > 0 ? total : 0,
      remainingAmount: 0,
      receiptNumber: generateReceiptNumber(),
    })
  }
}, [orderItems.length]) // Hanya depend on orderItems.length

  // Handle payment update dengan useCallback - FIXED
  const handlePaymentUpdate = useCallback((payment: PaymentDetails) => {
    setPaymentDetails(prev => {
      // Only update if actually changed
      if (prev && JSON.stringify(prev) === JSON.stringify(payment)) {
        return prev
      }
      return payment
    })
  }, [])

  const handleAddItem = (newItem: Omit<OrderItem, "id">) => {
    const existingItem = orderItems.find(item => 
      item.menu === newItem.menu && 
      item.temperature === newItem.temperature &&
      item.notes === newItem.notes
    )

    if (existingItem) {
      setOrderItems(orderItems.map(item => 
        item.id === existingItem.id 
          ? { ...item, quantity: item.quantity + newItem.quantity }
          : item
      ))
    } else {
      const item: OrderItem = {
        id: Date.now().toString(),
        ...newItem
      }
      setOrderItems([...orderItems, item])
    }
  }

  const handleRemoveItem = (id: string) => {
    setOrderItems(orderItems.filter(item => item.id !== id))
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(id)
      return
    }
    setOrderItems(orderItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const calculateTotalItems = (): number => {
    return orderItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  const validateForm = (): string | null => {
if (orderItems.length === 0) {
    return 'Minimal 1 item harus ditambahkan ke pesanan!'
  }

    if (!paymentDetails) {
      return 'Silakan lengkapi informasi pembayaran!'
    } 

    if (!paymentDetails.receiptNumber.trim()) {
      return 'Nomor kwitansi harus diisi!'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      alert(validationError)
      return
    }

    setShowConfirmation(true)
  }

  const confirmSubmit = async () => {
    setLoading(true)
    setShowConfirmation(false)

    try {
      const totalAmount = calculateTotal()
      
      const saleData = {
        customer: formData.customer.trim() || 'Walk-in Customer',
        customer_name: formData.customer.trim() || 'Walk-in Customer',
        notes: formData.notes.trim(),
        customer_notes: formData.notes.trim(),
        items: orderItems.map(item => ({
          product: item.menu,
          menu: item.menu,
          quantity: item.quantity,
          price: item.price,
          category: item.category,
          temperature: item.temperature,
          notes: item.notes,
          itemTotal: item.price * item.quantity
        })),
        totalAmount: totalAmount,
        total: totalAmount,
        itemCount: orderItems.length,
        payment_status: paymentDetails!.status,
        payment_method: paymentDetails!.method,
        sale_date: new Date().toISOString(),
        cashier: 'System',
        payment: paymentDetails!
      }

      console.log('Sending sale data:', saleData)

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || `Gagal menyimpan penjualan: ${response.status}`)
      }

      if (result.success) {
        alert('Penjualan berhasil disimpan!')
        resetForm()
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
    setPaymentDetails({
      method: 'CASH',
      status: 'UNPAID',
      amountPaid: 0,
      remainingAmount: 0,
      receiptNumber: generateReceiptNumber(),
    })
    setShowConfirmation(false)
  }

  const getPaymentStatusInfo = () => {
    if (!paymentDetails) return { color: 'text-gray-500', text: 'Belum diisi' }
    
    return paymentDetails.status === 'PAID' 
      ? { color: 'text-green-600', text: 'Lunas' }
      : { color: 'text-red-600', text: 'Belum Bayar' }
  }

  const getPaymentMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
      CASH: 'Tunai',
      QRIS: 'QRIS',
      TRANSFER: 'Transfer Bank'
    }
    return labels[method] || method
  }

  const paymentStatusInfo = getPaymentStatusInfo()
  const totalAmount = calculateTotal()
  const totalItems = calculateTotalItems()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Penjualan</h3>
            <p className="text-gray-600 mb-4">
              Apakah Anda yakin ingin menyimpan transaksi ini?
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-semibold">{formData.customer || 'Walk-in Customer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-semibold">{totalItems} pcs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold">Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${paymentDetails?.status === 'PAID' ? 'text-green-600' : 'text-red-600'}`}>
                  {paymentDetails?.status === 'PAID' ? 'LUNAS' : 'BELUM BAYAR'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Metode:</span>
                <span className="font-semibold">
                  {paymentDetails ? getPaymentMethodLabel(paymentDetails.method) : '-'}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={confirmSubmit}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  'Ya, Simpan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Input Penjualan Baru</h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">
                Lengkapi informasi penjualan di bawah ini
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 lg:mt-0 flex-wrap">
              <div className="text-sm">
                {orderItems.length > 0 ? (
                  <span className="flex items-center text-green-600 font-medium">
                    <span className="mr-1">📋</span>
                    {orderItems.length} item • {totalItems} pcs
                  </span>
                ) : (
                  <span className="text-yellow-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    Belum ada item
                  </span>
                )}
              </div>
              <span className={`text-sm font-medium ${paymentStatusInfo.color} flex items-center`}>
                {paymentStatusInfo.text === 'Lunas' && '✅'}
                {paymentStatusInfo.text === 'Belum Bayar' && '❌'}
                <span className="ml-1">{paymentStatusInfo.text}</span>
              </span>
              <button
                onClick={() => router.push('/dashboard/sales')}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
              >
                ← Kembali
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
            {/* Left Column - Order Input */}
            <div className="lg:col-span-7 space-y-6">
              {/* Progress Steps */}
              <div className="flex items-center bg-white p-4 rounded-lg shadow-sm">
                <div className={`flex items-center ${orderItems.length === 0 ? 'text-blue-600 font-semibold' : 'text-green-600'}`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2 ${
                    orderItems.length === 0 ? 'border-blue-600' : 'border-green-600 bg-green-600 text-white'
                  }`}>
                    1
                  </div>
                  <span className="text-sm">Pilih Menu</span>
                </div>
                <div className={`h-1 flex-1 mx-2 ${orderItems.length > 0 ? 'bg-green-600' : 'bg-gray-200'}`} />
                <div className={`flex items-center ${
                  paymentDetails ? 'text-green-600' : 
                  orderItems.length > 0 ? 'text-blue-600 font-semibold' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2 ${
                    paymentDetails ? 'border-green-600 bg-green-600 text-white' :
                    orderItems.length > 0 ? 'border-blue-600' : 'border-gray-300'
                  }`}>
                    2
                  </div>
                  <span className="text-sm">Pembayaran</span>
                </div>
              </div>

              {/* Menu Selector */}
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
                    <p className="text-xs text-gray-500 mt-1">
                      Kosongkan untuk menggunakan "Walk-in Customer"
                    </p>
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
<PaymentSectionCreate
  totalAmount={totalAmount}
  onPaymentUpdate={handlePaymentUpdate}
/>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-5">
              <div className="sticky top-20">
                <OrderList 
                  items={orderItems}
                  onRemoveItem={handleRemoveItem}
                  onUpdateQuantity={handleUpdateQuantity}
                  showActions={true}
                />

                {/* Action Buttons */}
                {orderItems.length > 0 && (
                  <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-blue-900">Total Pembayaran:</span>
                        <div className="text-right">
                          <div className="text-xl lg:text-2xl font-bold text-blue-600">
                            Rp {totalAmount.toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-blue-600">
                        {totalItems} items • {orderItems.length} jenis
                      </div>
                      
                      {paymentDetails && (
                        <div className="mt-3 pt-3 border-t border-blue-200 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Status:</span>
                            <span className={`font-medium ${paymentDetails.status === 'PAID' ? 'text-green-600' : 'text-red-600'}`}>
                              {paymentDetails.status === 'PAID' ? 'LUNAS' : 'BELUM BAYAR'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Metode:</span>
                            <span className="font-medium">
                              {getPaymentMethodLabel(paymentDetails.method)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={loading || !paymentDetails}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-lg text-sm lg:text-base"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
                        disabled={loading}
                        className="px-3 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 flex items-center"
                        title="Reset formulir"
                      >
                        <span className="text-sm">🔄</span>
                      </button>
                    </div>

                    {!paymentDetails && (
                      <p className="text-sm text-yellow-600 mt-3 text-center">
                        ⚠️ Lengkapi informasi pembayaran terlebih dahulu
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}