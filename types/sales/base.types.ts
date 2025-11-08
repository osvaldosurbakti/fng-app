// ==================== BASE TYPES ====================
export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER';
export type PaymentStatus = 'PAID' | 'UNPAID';
export type Temperature = 'panas' | 'dingin' | '';
export type Category = 'makanan' | 'minuman' | string;

export interface BasePayment {
  method: PaymentMethod;
  status: PaymentStatus;
  amountPaid: number;
  remainingAmount: number;
  receiptNumber: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  product: string;
  quantity: number;
  price: number;
  category: Category;
  temperature?: Temperature;
  notes?: string;
  itemTotal: number;
  menu?: string; // For backward compatibility
}

export interface Sale {
  _id: string;
  id?: string;
  customer: string;
  customer_name?: string;
  customer_phone?: string;
  customer_notes?: string;
  notes: string;
  items: SaleItem[];
  totalAmount: number;
  total?: number;
  itemCount: number;
  invoice_number?: string;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  sale_date?: string;
  cashier?: string;
  createdAt: string;
  updatedAt: string;
  payment: BasePayment;
}

export interface OrderItem {
  id: string;
  category: Category;
  menu: string;
  quantity: number;
  price: number;
  temperature?: Temperature;
  notes?: string;
}