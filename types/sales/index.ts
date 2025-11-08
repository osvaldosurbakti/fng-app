// ==================== MAIN EXPORTS ====================
export * from './base.types';
export * from './request.types';
export * from './utility.types';

// ==================== CONSTANTS ====================
export const TEMPERATURE_OPTIONS = {
  PANAS: 'panas',
  DINGIN: 'dingin'
} as const;

export const CATEGORY_OPTIONS = {
  FOOD: 'makanan',
  DRINK: 'minuman'
} as const;

export const PAYMENT_METHODS = {
  CASH: 'CASH',
  QRIS: 'QRIS', 
  TRANSFER: 'TRANSFER'
} as const;

export const PAYMENT_STATUSES = {
  PAID: 'PAID',
  UNPAID: 'UNPAID'
} as const;

// ==================== UTILITY FUNCTIONS ====================
// Basic utilities yang sering digunakan
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

// Type guards
export const isPaymentMethod = (method: string): method is typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS] => {
  return Object.values(PAYMENT_METHODS).includes(method as any);
};

export const isPaymentStatus = (status: string): status is typeof PAYMENT_STATUSES[keyof typeof PAYMENT_STATUSES] => {
  return Object.values(PAYMENT_STATUSES).includes(status.toUpperCase() as any);
};

