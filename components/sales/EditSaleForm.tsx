import { useState, useEffect } from "react";
import { Sale } from "@/types/sales";
import { X, Save } from "lucide-react";

interface EditSaleFormProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (sale: Sale) => void;
}

export default function EditSaleForm({ sale, isOpen, onClose, onSave }: EditSaleFormProps) {
  const [formData, setFormData] = useState<Sale | null>(null);

  useEffect(() => {
    if (sale) {
      setFormData({ ...sale });
    }
  }, [sale]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleItemQuantityChange = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity,
    };

    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    setFormData({
      ...formData,
      items: updatedItems,
      totalAmount: newTotal,
    });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    
    if (updatedItems.length === 0) {
      alert("Pesanan harus memiliki minimal 1 item");
      return;
    }

    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    setFormData({
      ...formData,
      items: updatedItems,
      totalAmount: newTotal,
      itemCount: updatedItems.length,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Edit Penjualan</h3>
              <p className="text-gray-600 mt-1">{formData.invoice_number || `Order #${formData._id.slice(-6)}`}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Informasi Customer</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Customer
                  </label>
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Ringkasan Pesanan</h4>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Penjualan:</span>
                    <span className="text-green-600">
                      Rp {formData.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {formData.itemCount} item • {formData.items.reduce((sum, item) => sum + item.quantity, 0)} pcs
                  </div>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">Item Pesanan</h4>
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.product}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="capitalize">{item.category}</span>
                        {item.temperature && (
                          <span className="capitalize">• {item.temperature}</span>
                        )}
                        <span>• Rp {item.price.toLocaleString('id-ID')}/pcs</span>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-blue-600 mt-1">Note: {item.notes}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleItemQuantityChange(index, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleItemQuantityChange(index, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-right min-w-[100px]">
                        <p className="font-semibold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800 p-2 transition-colors"
                        title="Hapus item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}