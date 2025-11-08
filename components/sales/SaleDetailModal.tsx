import { Sale } from "@/types/sales";
import { X, Calendar, User, Phone, FileText } from "lucide-react";
import { formatCurrency, formatDate, getPaymentMethodText, getStatusColor, getProductName } from "@/utils/sales";

interface SaleDetailModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SaleDetailModal({ sale, isOpen, onClose }: SaleDetailModalProps) {
  if (!sale || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Detail Penjualan
              </h3>
              <p className="text-sm text-gray-500 mt-1">{sale.invoice_number}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(sale.sale_date || sale.createdAt)}
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {sale.cashier || 'System'}
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informasi Pelanggan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nama Pelanggan</p>
                <p className="font-medium text-lg">{sale.customer || "Walk-in Customer"}</p>
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
            </div>
            {sale.customer_notes && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">Catatan Pelanggan</p>
                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg mt-1 border border-blue-200">
                  {sale.customer_notes}
                </p>
              </div>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-lg mb-4">Informasi Pembayaran</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Metode Pembayaran</p>
                <p className="font-medium text-lg">{getPaymentMethodText(sale.payment_method)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className={`font-medium text-lg ${
                  sale.payment_status === 'PAID' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {sale.payment_status === 'PAID' ? 'LUNAS' : 'BELUM BAYAR'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tagihan</p>
                <p className="font-medium text-lg">Rp {sale.totalAmount.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dibayar</p>
                <p className="font-medium text-lg">Rp {(sale.payment?.amountPaid || 0).toLocaleString('id-ID')}</p>
              </div>
            </div>
            {sale.payment?.receiptNumber && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">Nomor Kwitansi</p>
                <p className="font-medium">{sale.payment.receiptNumber}</p>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Detail Pesanan ({sale.itemCount} items)
            </h4>
            
            {/* Items List */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {(sale.items || []).map((item, index) => (
                  <div key={index} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.menu || item.product}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                          <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                            {item.category}
                          </span>
                          {item.temperature && (
                            <span className="capitalize bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {item.temperature}
                            </span>
                          )}
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                            {item.quantity} pcs
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-gray-700 mt-2 bg-yellow-50 p-2 rounded">
                            📝 {item.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                        <p className="text-sm text-gray-600">@ Rp {item.price.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="bg-gray-50 p-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Pembayaran</span>
                  <span className="text-2xl font-bold text-green-600">
                    Rp {sale.totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {sale.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Catatan Tambahan</p>
                <p className="text-sm text-gray-700 bg-orange-50 p-3 rounded-lg border border-orange-200">
                  📋 {sale.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}