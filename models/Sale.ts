import mongoose from 'mongoose';

const SaleItemSchema = new mongoose.Schema({
  product: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
  },
  temperature: String,
  notes: String,
  itemTotal: Number,
});

const PaymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['CASH', 'QRIS', 'TRANSFER'],
    default: 'CASH',
  },
  status: {
    type: String,
    enum: ['PAID', 'PARTIAL', 'UNPAID'],
    default: 'UNPAID',
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  remainingAmount: {
    type: Number,
    default: 0,
  },
  proofImage: String,
  receiptNumber: String,
  updatedAt: Date,
});

const SaleSchema = new mongoose.Schema({
  customer: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  items: [SaleItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  itemCount: {
    type: Number,
    required: true,
    min: 1,
  },
  invoice_number: {
    type: String,
    required: true,
    unique: true,
  },
  payment: PaymentSchema,
  sale_date: {
    type: Date,
    default: Date.now,
  },
  cashier: {
    type: String,
    default: 'System',
  }
}, {
  timestamps: true
});

export default mongoose.models.Sale || mongoose.model('Sale', SaleSchema);