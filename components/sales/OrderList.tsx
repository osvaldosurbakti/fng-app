import { OrderItem } from '@/types/sales';

interface OrderListProps {
  items: OrderItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
    showActions?: boolean; // ✅ Tambahkan ini
}

export default function OrderList({ items, onRemoveItem, onUpdateQuantity }: OrderListProps) {
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-4xl mb-3">🛒</div>
        <h3 className="font-medium text-gray-900 mb-1">Keranjang Kosong</h3>
        <p className="text-gray-500 text-sm">
          Silakan pilih menu untuk memulai pesanan
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <span className="p-1.5 bg-blue-100 rounded-lg">🛒</span>
          Pesanan ({items.length})
        </h3>
        <span className="text-sm text-gray-500">
          {items.reduce((sum, item) => sum + item.quantity, 0)} items
        </span>
      </div>

      {/* Items List */}
      <div className="divide-y max-h-[600px] overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 hover:bg-gray-50 transition-colors relative group"
          >
            <div className="flex items-start gap-4">
              {/* Item Icon */}
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                {item.category === 'makanan' ? '🍱' : '🥤'}
              </div>

              {/* Item Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.menu}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <span className="capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                      {item.temperature && (
                        <span className="capitalize bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          {item.temperature}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <span className="font-semibold text-gray-900">
                    Rp {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    Hapus
                  </button>
                </div>

                {item.notes && (
                  <div className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                    📝 {item.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Section */}
      <div className="border-t p-4">
        <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
          <span>Subtotal</span>
          <span>Rp {totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
          <span>Total</span>
          <span className="text-blue-600">Rp {totalAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}