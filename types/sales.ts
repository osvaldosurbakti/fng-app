export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER';
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID' | 'paid' | 'unpaid' | 'partial';

export interface Payment {
  method: PaymentMethod;
  status: PaymentStatus;
  amountPaid: number;
  remainingAmount: number;
  proofImage?: string;
  receiptNumber: string;
  updatedAt: string;
}

export interface PaymentDetails {
  method: PaymentMethod;
  status: PaymentStatus;
  amountPaid: number;
  remainingAmount: number;
  proofImage?: string;
  receiptNumber: string;
}

export interface SaleItem {
  product: string
  quantity: number
  price: number
  category: string
  temperature?: string
  notes?: string
  itemTotal: number
}

export interface Sale {
  _id: string
  id?: string
  customer: string
  customer_name?: string // Untuk kompatibilitas
  customer_phone?: string
  customer_notes?: string
  notes: string
  items: SaleItem[]
  totalAmount: number
  total?: number // Untuk kompatibilitas
  itemCount: number
  invoice_number?: string
  payment_status: PaymentStatus
  payment_method?: PaymentMethod
  sale_date?: string
  cashier?: string
  createdAt: string
  updatedAt: string
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    amountPaid: number;
    remainingAmount: number;
    proofImage?: string;
    receiptNumber: string;
    updatedAt: string;
  };
}

export interface CartItem {
  product: string
  quantity: number
  price: number
  category: string
  temperature?: string
  notes?: string
}

export interface OrderItem {
  id: string;
  category: 'minuman' | 'makanan';
  menu: string;
  quantity: number;
  price: number;
  temperature?: 'panas' | 'dingin';
  notes?: string;
}