import type { PaymentMethod, PaymentStatus } from './base.types';

export type PaymentFormData = {
  method: PaymentMethod;
  amountPaid: number;
  receiptNumber: string;
  proofImage?: string;
};

export type CustomerFormData = {
  customer: string;
  customer_phone?: string;
  customer_notes?: string;
  notes: string;
};

export type CartItem = {
  product: string;
  quantity: number;
  price: number;
  category: string;
  temperature?: string;
  notes?: string;
};