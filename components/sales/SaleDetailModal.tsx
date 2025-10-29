import { Sale } from "@/types/sales";
import { X, Calendar, User, Phone, FileText } from "lucide-react";
import { formatCurrency, formatDate, getPaymentMethodText, getStatusColor, getProductName } from "./utils";

interface SaleDetailModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SaleDetailModal({ sale, isOpen, onClose }: SaleDetailModalProps) {
  if (!sale || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Detail Penjualan
              </h3>
              <p className="text-sm text-gray-500">{sale.invoice_number}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Customer Info */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informasi Customer
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nama</p>
                <p className="font-medium">{sale.customer || "Tanpa Nama"}</p>
              </div>
              {sale.customer_phone && (
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Telepon
                  </p>
                  <p className="font-medium">{sale.customer_phone}</p>
                </div>
              )}
              {sale.customer_notes && (
                <div>
                  <p className="text-sm text-gray-600">Catatan Customer</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1">
                    {sale.customer_notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Informasi Pembayaran</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Metode Pembayaran</p>
                <p className="font-medium">{getPaymentMethodText(sale.payment_method)}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium">{sale.payment_status === 'paid' ? 'Lunas' : 'Pending'}</p>
              </div>
              <div>
                <p className="text-gray-600">Jumlah Dibayar</p>
                <p className="font-medium">Rp {sale.payment?.amountPaid?.toLocaleString('id-ID') || '0'}</p>
              </div>
              <div>
                <p className="text-gray-600">Sisa Pembayaran</p>
                <p className="font-medium">Rp {sale.payment?.remainingAmount?.toLocaleString('id-ID') || '0'}</p>
              </div>
              {sale.payment.proofImage && (
                <div className="col-span-2">
                  <p className="text-gray-600 mb-2">Bukti Pembayaran</p>
                  <img 
                    src={sale.payment.proofImage} 
                    alt="Bukti Pembayaran"
                    className="max-w-full h-auto rounded-lg" 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-2">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Detail Pesanan
            </h4>
            
            {/* Items List */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {(sale.items || []).map((item, index) => (
                  <div key={index} className="flex justify-between items-start pb-3 border-b border-gray-200 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{getProductName(item)}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                        <span className="capitalize">{item.category}</span>
                        {item.temperature && (
                          <span className="capitalize">• {item.temperature}</span>
                        )}
                        <span>• {item.quantity} pcs</span>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-blue-600 mt-1">Note: {item.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                      <p className="text-sm text-gray-600">Rp {item.price.toLocaleString('id-ID')}/pcs</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-gray-300">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">Rp {sale.totalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {sale.notes && (
              <div className="mt-6">
                <p className="text-sm text-gray-600">Catatan Tambahan</p>
                <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded mt-1 border border-yellow-200">
                  {sale.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}