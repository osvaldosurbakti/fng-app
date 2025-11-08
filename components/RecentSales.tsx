interface Sale {
  id: string;
  invoice_number: string;
  customer_name: string;
  amount: number;
  date: string;
  status: 'PAID' | 'pending';
}

interface RecentSalesProps {
  sales: Sale[];
}

export default function RecentSales({ sales }: RecentSalesProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Penjualan Terbaru
      </h2>
      <div className="space-y-4">
        {sales.map((sale) => (
          <div key={sale.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
            <div>
              <p className="font-medium text-gray-900">{sale.invoice_number}</p>
              <p className="text-sm text-gray-500">{sale.customer_name}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {formatCurrency(sale.amount)}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(sale.date).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}