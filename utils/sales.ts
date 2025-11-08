import type { 
  PaymentMethod, 
  PaymentStatus, 
  OrderItem, 
  SaleItem,
  PaymentDetails 
} from '@/types/sales';

// ==================== FORMATTING FUNCTIONS ====================
export const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatDateTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ==================== PAYMENT UTILITIES ====================
export const getPaymentMethodText = (method?: string): string => {
  const methods: Record<string, string> = {
    CASH: 'Tunai',
    TRANSFER: 'Transfer Bank',
    QRIS: 'QRIS',
    cash: 'Tunai',
    transfer: 'Transfer Bank',
    qris: 'QRIS',
  };
  return method ? methods[method] || method : 'Tunai';
};

export const getPaymentStatusText = (status?: string): string => {
  const statuses: Record<string, string> = {
    PAID: 'Lunas',
    PARTIAL: 'Bayar Sebagian',
    UNPAID: 'Belum Bayar',
    paid: 'Lunas',
    pending: 'Menunggu',
    cancelled: 'Dibatalkan',
  };
  return status ? statuses[status] || status : 'Belum Bayar';
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PAID: 'text-green-600 bg-green-100',
    UNPAID: 'text-red-600 bg-red-100',
    PARTIAL: 'text-yellow-600 bg-yellow-100',
    paid: 'text-green-600 bg-green-100',
    unpaid: 'text-red-600 bg-red-100',
    pending: 'text-yellow-600 bg-yellow-100'
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
};

// ==================== PRODUCT UTILITIES ====================
export const getProductName = (item: any): string => {
  return item.menu || item.product || 'Unknown Product';
};

// ==================== CALCULATION UTILITIES ====================
export const calculateItemTotal = (price: number, quantity: number): number => {
  return price * quantity;
};

export const calculateSaleTotal = (items: Array<{ price: number; quantity: number }>): number => {
  return items.reduce((total, item) => total + calculateItemTotal(item.price, item.quantity), 0);
};

export const generateReceiptNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RCP-${timestamp}-${random}`;
};

// ==================== TRANSFORM FUNCTIONS ====================
export const transformOrderItemToSaleItem = (orderItem: OrderItem): SaleItem => {
  return {
    id: orderItem.id,
    product: orderItem.menu,
    category: orderItem.category,
    quantity: orderItem.quantity,
    price: orderItem.price,
    temperature: orderItem.temperature,
    notes: orderItem.notes,
    itemTotal: calculateItemTotal(orderItem.price, orderItem.quantity),
    menu: orderItem.menu
  };
};

export const getDefaultPaymentDetails = (): PaymentDetails => ({
  method: 'CASH',
  status: 'UNPAID',
  amountPaid: 0,
  remainingAmount: 0,
  receiptNumber: generateReceiptNumber(),
});

// ==================== VALIDATION UTILITIES ====================
export const isValidSale = (sale: any): boolean => {
  return !!(sale && sale.items && sale.items.length > 0 && sale.totalAmount > 0);
};

export const getPaymentMethodColor = (method: string): string => {
  const colors: Record<string, string> = {
    CASH: 'bg-green-100 text-green-800',
    QRIS: 'bg-blue-100 text-blue-800', 
    TRANSFER: 'bg-purple-100 text-purple-800',
    cash: 'bg-green-100 text-green-800',
    qris: 'bg-blue-100 text-blue-800',
    transfer: 'bg-purple-100 text-purple-800'
  };
  return colors[method] || 'bg-gray-100 text-gray-800';
};