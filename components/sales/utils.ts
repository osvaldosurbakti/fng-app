export const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getPaymentMethodText = (method?: string): string => {
  const methods: { [key: string]: string } = {
    cash: 'Tunai',
    transfer: 'Transfer',
    qris: 'QRIS',
    card: 'Kartu',
  };
  return method ? methods[method] || method : 'Tunai';
};

export const getStatusColor = (status?: string): string => {
  const colors: { [key: string]: string } = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return status ? colors[status] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';
};

// Helper untuk mendapatkan nama produk (kompatibilitas)
export const getProductName = (item: any): string => {
  return item.product || item.menu || 'Unknown Product';
};

// Helper untuk mendapatkan total amount (kompatibilitas)
export const getTotalAmount = (sale: any): number => {
  return sale.totalAmount || sale.total || 0;
};