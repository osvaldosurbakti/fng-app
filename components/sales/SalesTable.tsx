import { Sale, PaymentMethod, PaymentStatus } from '@/types/sales';
import { Eye, Edit, Trash2 } from "lucide-react";
import { formatCurrency, formatDate, getPaymentMethodText, getStatusColor, getProductName } from "./utils";

interface SalesTableProps {
  sales: Sale[];
  onViewDetail: (sale: Sale) => void;
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
}

export default function SalesTable({ sales, onViewDetail, onEdit, onDelete }: SalesTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Invoice</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Customer</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Total</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Pembayaran</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tanggal</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sales.map((sale) => (
            <tr key={sale._id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">{sale.invoice_number}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{sale.customer}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                Rp {sale.totalAmount.toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${getPaymentMethodColor(sale.payment.method)}`}>
                    {getPaymentMethodLabel(sale.payment.method)}
                  </span>
                  {sale.payment.status === 'PARTIAL' && (
                    <span className="text-xs text-gray-500 mt-1">
                      Dibayar: Rp {sale.payment.amountPaid.toLocaleString()}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                  ${getPaymentStatusColor(sale.payment.status)}`}>
                  {getPaymentStatusLabel(sale.payment.status)}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {new Date(sale.sale_date || sale.createdAt || new Date()).toLocaleDateString('id-ID')}
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                <button
                  onClick={() => onViewDetail(sale)}
                  title="Lihat Detail"
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(sale)}
                  title="Edit"
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(sale)}
                  title="Hapus"
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getPaymentMethodColor(method: PaymentMethod) {
  switch (method) {
    case 'CASH': return 'bg-green-100 text-green-800';
    case 'QRIS': return 'bg-blue-100 text-blue-800';
    case 'TRANSFER': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getPaymentMethodLabel(method: PaymentMethod) {
  switch (method) {
    case 'CASH': return '💵 Tunai';
    case 'QRIS': return '📱 QRIS';
    case 'TRANSFER': return '🏦 Transfer';
    default: return method;
  }
}

function getPaymentStatusColor(status: PaymentStatus) {
  switch (status) {
    case 'PAID': return 'bg-green-100 text-green-800';
    case 'PARTIAL': return 'bg-yellow-100 text-yellow-800';
    case 'UNPAID': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getPaymentStatusLabel(status: PaymentStatus) {
  switch (status) {
    case 'PAID': return '✅ Lunas';
    case 'PARTIAL': return '⏳ Sebagian';
    case 'UNPAID': return '❌ Belum Bayar';
    default: return status;
  }
}