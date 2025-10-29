import { Sale } from "@/types/sales";

interface SalesSummaryProps {
  sales: Sale[];
}

export default function SalesSummary({ sales }: SalesSummaryProps) {
  const totalSales = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const totalTransactions = sales.length;
  const paidTransactions = sales.filter(sale => sale.payment_status === 'paid').length;
  const totalItems = sales.reduce((sum, sale) => {
    return sum + (sale.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0);
  }, 0);
  const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <p className="text-sm text-gray-600">Total Penjualan</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          Rp {totalSales.toLocaleString('id-ID')}
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <p className="text-sm text-gray-600">Jumlah Transaksi</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {totalTransactions}
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <p className="text-sm text-gray-600">Item Terjual</p>
        <p className="text-2xl font-bold text-green-600 mt-1">
          {totalItems}
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <p className="text-sm text-gray-600">Rata-rata/Transaksi</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          Rp {Math.round(averageTransaction).toLocaleString('id-ID')}
        </p>
      </div>
    </div>
  );
}