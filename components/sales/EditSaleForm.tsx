import { useState, useEffect } from "react";
import { Sale, SaleItem } from "@/types/sales";
import { X, Save, Trash2, Plus, Minus } from "lucide-react";

interface EditSaleFormProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (sale: Sale) => void;
}

export default function EditSaleForm({ sale, isOpen, onClose, onSave }: EditSaleFormProps) {
  const [formData, setFormData] = useState<Sale | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (isOpen && sale) {
      const initializedSale: Sale = {
        ...sale,
        items: sale.items.map(item => ({
          ...item,
          price: ensureNumber(item.price),
          quantity: ensureNumber(item.quantity),
          itemTotal: ensureNumber(item.itemTotal) || ensureNumber(item.price) * ensureNumber(item.quantity)
        })),
        totalAmount: ensureNumber(sale.totalAmount) || ensureNumber(sale.total) || 0,
        total: ensureNumber(sale.total) || ensureNumber(sale.totalAmount) || 0,
        itemCount: ensureNumber(sale.itemCount) || sale.items.length
      };
      setFormData(initializedSale);
    }
  }, [sale, isOpen]);

  // Helper function to ensure value is number
  const ensureNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  if (!isOpen || !formData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      alert("Pesanan harus memiliki minimal 1 item");
      return;
    }

    // Validasi data sebelum save
    const validatedData: Sale = {
      ...formData,
      items: formData.items.map(item => ({
        ...item,
        price: ensureNumber(item.price),
        quantity: ensureNumber(item.quantity),
        itemTotal: ensureNumber(item.price) * ensureNumber(item.quantity)
      })),
      totalAmount: formData.items.reduce((sum, item) => 
        sum + (ensureNumber(item.price) * ensureNumber(item.quantity)), 0),
      total: formData.items.reduce((sum, item) => 
        sum + (ensureNumber(item.price) * ensureNumber(item.quantity)), 0),
      itemCount: formData.items.length
    };

    setIsSubmitting(true);
    try {
      await onSave(validatedData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleItemQuantityChange = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    const updatedItems = [...formData.items];
    const itemPrice = ensureNumber(updatedItems[index].price);
    
    updatedItems[index] = {
      ...updatedItems[index],
      quantity,
      itemTotal: itemPrice * quantity
    };

    const newTotal = updatedItems.reduce((sum, item) => 
      sum + (ensureNumber(item.price) * ensureNumber(item.quantity)), 0);

    setFormData({
      ...formData,
      items: updatedItems,
      totalAmount: newTotal,
      total: newTotal,
      itemCount: updatedItems.length
    });
  };

  const handleItemPriceChange = (index: number, price: number) => {
    if (price < 0) return;
    
    const updatedItems = [...formData.items];
    const itemQuantity = ensureNumber(updatedItems[index].quantity);
    
    updatedItems[index] = {
      ...updatedItems[index],
      price,
      itemTotal: price * itemQuantity
    };

    const newTotal = updatedItems.reduce((sum, item) => 
      sum + (ensureNumber(item.price) * ensureNumber(item.quantity)), 0);

    setFormData({
      ...formData,
      items: updatedItems,
      totalAmount: newTotal,
      total: newTotal
    });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    
    if (updatedItems.length === 0) {
      alert("Pesanan harus memiliki minimal 1 item");
      return;
    }

    const newTotal = updatedItems.reduce((sum, item) => 
      sum + (ensureNumber(item.price) * ensureNumber(item.quantity)), 0);

    setFormData({
      ...formData,
      items: updatedItems,
      totalAmount: newTotal,
      total: newTotal,
      itemCount: updatedItems.length
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const getProductName = (item: SaleItem): string => {
    return item.product || item.menu || "Unknown Product";
  };

  const getTotalQuantity = (): number => {
    return formData.items.reduce((sum, item) => sum + ensureNumber(item.quantity), 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Edit Penjualan</h3>
              <p className="text-gray-600 mt-1">
                {formData.invoice_number || `Order #${formData._id?.slice(-6) || 'N/A'}`}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(formData.createdAt).toLocaleDateString('id-ID')}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Informasi Customer</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Customer
                  </label>
                  <input
                    type="text"
                    value={formData.customer || formData.customer_name || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      customer: e.target.value,
                      customer_name: e.target.value 
                    })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Customer
                  </label>
                  <textarea
                    value={formData.customer_notes || formData.notes || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      customer_notes: e.target.value,
                      notes: e.target.value 
                    })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Tambah catatan untuk pesanan ini..."
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Ringkasan Pesanan</h4>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Penjualan:</span>
                    <span className="text-lg font-bold text-green-600">
                      Rp {formatCurrency(formData.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Jumlah Item:</span>
                    <span>{formData.itemCount} item</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Total Quantity:</span>
                    <span>{getTotalQuantity()} pcs</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Status Pembayaran:</span>
                    <span className={`font-medium ${
                      formData.payment_status === 'PAID' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formData.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Item Pesanan</h4>
                <span className="text-sm text-gray-600">
                  {formData.items.length} items
                </span>
              </div>
              
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {getProductName(item)}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                          {item.category || 'No Category'}
                        </span>
                        {item.temperature && (
                          <span className="capitalize bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {item.temperature}
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-sm text-blue-600 mt-1 truncate">
                          📝 {item.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 ml-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleItemQuantityChange(index, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-12 text-center font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleItemQuantityChange(index, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {/* Price Input */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Rp</span>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleItemPriceChange(index, parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                          min="0"
                          step="100"
                        />
                      </div>
                      
                      {/* Item Total */}
                      <div className="text-right min-w-[120px]">
                        <p className="font-semibold text-gray-900">
                          Rp {formatCurrency(item.itemTotal)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Rp {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800 p-2 transition-colors"
                        title="Hapus item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              Terakhir update: {new Date(formData.updatedAt).toLocaleString('id-ID')}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || formData.items.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}