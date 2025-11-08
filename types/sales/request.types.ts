import type { 
  BasePayment, 
  PaymentStatus, 
  PaymentMethod, 
  SaleItem,
  Sale 
} from './base.types';

export interface PaymentDetails extends Omit<BasePayment, 'updatedAt'> {}

export interface CreateSaleRequest {
  customer: string;
  customer_name?: string;
  customer_phone?: string;
  customer_notes?: string;
  notes: string;
  items: SaleItem[];
  totalAmount: number;
  total?: number;
  itemCount: number;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  sale_date?: string;
  cashier?: string;
  payment: PaymentDetails;
}

export interface UpdateSaleRequest extends Partial<CreateSaleRequest> {
  _id: string;
}

export interface SaleResponse {
  success: boolean;
  data?: Sale;
  message?: string;
  error?: string;
}

export interface SalesListResponse {
  success: boolean;
  data: Sale[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SalesFilter {
  startDate?: string;
  endDate?: string;
  payment_status?: PaymentStatus;
  payment_method?: PaymentMethod;
  customer?: string;
  page?: number;
  limit?: number;
}