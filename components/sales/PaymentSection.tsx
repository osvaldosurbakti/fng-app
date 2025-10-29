import { useState } from 'react';
import { PaymentMethod, PaymentStatus, PaymentDetails } from '@/types/sales';

interface PaymentSectionProps {
  totalAmount: number;
  onPaymentUpdate: (payment: PaymentDetails) => void;
}

export default function PaymentSection({ totalAmount, onPaymentUpdate }: PaymentSectionProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('UNPAID');
  const [amountPaid, setAmountPaid] = useState(0);
  const [proofImage, setProofImage] = useState<string>();

  const handlePaymentUpdate = () => {
    const remainingAmount = totalAmount - amountPaid;
    const receiptNumber = `RCP-${Date.now()}`;

    onPaymentUpdate({
      method: paymentMethod,
      status: paymentStatus,
      amountPaid,
      remainingAmount,
      proofImage,
      receiptNumber
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">💳 Informasi Pembayaran</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metode Pembayaran
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="CASH">Tunai</option>
            <option value="QRIS">QRIS</option>
            <option value="TRANSFER">Transfer Bank</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status Pembayaran
          </label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="PAID">Lunas</option>
            <option value="PARTIAL">Bayar Sebagian</option>
            <option value="UNPAID">Belum Bayar</option>
          </select>
        </div>

        {paymentStatus !== 'UNPAID' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Dibayar
            </label>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(Number(e.target.value))}
              max={totalAmount}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        )}

        {(paymentMethod === 'QRIS' || paymentMethod === 'TRANSFER') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bukti Pembayaran
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => setProofImage(e.target?.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full"
            />
          </div>
        )}

        <button
          onClick={handlePaymentUpdate}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Update Pembayaran
        </button>
      </div>
    </div>
  );
}
