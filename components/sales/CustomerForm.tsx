import { CustomerInfo } from './types';

interface CustomerFormProps {
  customer: CustomerInfo;
  onChange: (customer: CustomerInfo) => void;
}

export default function CustomerForm({ customer, onChange }: CustomerFormProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Informasi Customer</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Customer *
          </label>
          <input
            type="text"
            value={customer.name}
            onChange={(e) => onChange({ ...customer, name: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Masukkan nama customer..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            No. Telepon
          </label>
          <input
            type="tel"
            value={customer.phone || ''}
            onChange={(e) => onChange({ ...customer, phone: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="08123456789"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catatan Khusus
        </label>
        <textarea
          value={customer.notes || ''}
          onChange={(e) => onChange({ ...customer, notes: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Catatan tambahan untuk pesanan..."
          rows={3}
        />
      </div>
    </div>
  );
}