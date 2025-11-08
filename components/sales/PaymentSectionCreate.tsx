'use client'

import { useState, useEffect } from 'react'
import type { PaymentMethod, PaymentDetails } from '@/types/sales'

interface PaymentSectionCreateProps {
  totalAmount: number
  onPaymentUpdate: (payment: PaymentDetails) => void
}

export default function PaymentSectionCreate({ 
  totalAmount, 
  onPaymentUpdate 
}: PaymentSectionCreateProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [isPaid, setIsPaid] = useState(totalAmount > 0)
  const [receiptNumber, setReceiptNumber] = useState(`RCP-${Date.now()}`)

  // Update parent hanya ketika ada perubahan manual oleh user
  const updateParent = () => {
    const paymentDetails: PaymentDetails = {
      method: paymentMethod,
      status: isPaid ? 'PAID' : 'UNPAID',
      amountPaid: isPaid ? totalAmount : 0,
      remainingAmount: isPaid ? 0 : totalAmount,
      receiptNumber,
    }
    onPaymentUpdate(paymentDetails)
  }

  // Manual updates - tidak pakai useEffect yang otomatis
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method)
    if (method === 'CASH' && totalAmount > 0) {
      setIsPaid(true)
    }
    setTimeout(updateParent, 0)
  }

  const handlePaymentStatusChange = (paid: boolean) => {
    setIsPaid(paid)
    setTimeout(updateParent, 0)
  }

  const handleReceiptNumberChange = (value: string) => {
    setReceiptNumber(value)
    setTimeout(updateParent, 0)
  }

  // Hanya initialize sekali saat pertama render
  useEffect(() => {
    updateParent()
  }, []) // Empty dependency array

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    const labels: Record<PaymentMethod, string> = {
      CASH: 'Tunai',
      QRIS: 'QRIS',
      TRANSFER: 'Transfer Bank'
    }
    return labels[method]
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <span className="p-2 bg-green-100 rounded-lg">💳</span>
        Informasi Pembayaran
      </h3>
      
      <div className="space-y-6">
        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metode Pembayaran *
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => handlePaymentMethodChange(e.target.value as PaymentMethod)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="CASH">Tunai</option>
            <option value="QRIS">QRIS</option>
            <option value="TRANSFER">Transfer Bank</option>
          </select>
        </div>

        {/* Payment Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Status Pembayaran *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={isPaid}
                onChange={() => handlePaymentStatusChange(true)}
                className="mr-2"
                disabled={paymentMethod === 'CASH' && totalAmount > 0}
              />
              <span className={`flex items-center gap-2 ${isPaid ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                <span>✅</span> Lunas
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={!isPaid}
                onChange={() => handlePaymentStatusChange(false)}
                className="mr-2"
                disabled={paymentMethod === 'CASH' && totalAmount > 0}
              />
              <span className={`flex items-center gap-2 ${!isPaid ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                <span>❌</span> Belum Bayar
              </span>
            </label>
          </div>
          {paymentMethod === 'CASH' && totalAmount > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Untuk pembayaran tunai, status otomatis "Lunas"
            </p>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Tagihan:</span>
            <span className="font-semibold">Rp {totalAmount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Status:</span>
            <span className={`font-semibold ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
              {isPaid ? 'LUNAS' : 'BELUM BAYAR'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Metode:</span>
            <span className="font-semibold">{getPaymentMethodLabel(paymentMethod)}</span>
          </div>
        </div>

        {/* Receipt Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nomor Kwitansi *
          </label>
          <input
            type="text"
            value={receiptNumber}
            onChange={(e) => handleReceiptNumberChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
            required
          />
        </div>

        {/* Payment Status Info */}
        <div className={`p-3 rounded-lg text-sm ${
          isPaid ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {isPaid ? '✅ Pembayaran Lunas' : '❌ Menunggu Pembayaran'}
            </span>
          </div>
          <p className="mt-1">
            {isPaid 
              ? `Pembayaran sudah lunas menggunakan ${getPaymentMethodLabel(paymentMethod)}`
              : 'Pelanggan belum melakukan pembayaran.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}