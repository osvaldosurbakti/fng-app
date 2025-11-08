import { X, AlertTriangle } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/sales";
import { Sale } from "@/types/sales";

interface DeleteConfirmationModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmationModal({
  sale,
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Hapus Penjualan</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Apakah Anda yakin ingin menghapus penjualan ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-semibold text-red-900">
              {sale.invoice_number || `Order #${sale._id?.slice(-6) || 'Unknown'}`}
            </p>
            <p className="text-red-700 text-sm mt-1">{sale.customer || "Tanpa Nama"}</p>
            <div className="flex justify-between items-center mt-2 text-sm text-red-600">
              <span>{formatDate(sale.createdAt)}</span>
              <span className="font-semibold">
                Rp {sale.totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="text-xs text-red-500 mt-1">
              {sale.itemCount || sale.items?.length || 0} item • {' '}
              {sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} pcs
            </div>
          </div>

          <p className="text-sm text-red-600 mt-4">
            ⚠️ Semua data penjualan ini akan dihapus permanen.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}