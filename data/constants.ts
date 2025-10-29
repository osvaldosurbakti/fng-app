export const ITEMS_PER_PAGE = 10;

export const PAYMENT_METHODS = {
  cash: "Tunai",
  transfer: "Transfer",
  qris: "QRIS"
} as const;

export const PAYMENT_STATUS = {
  paid: "Lunas",
  pending: "Pending"
} as const;

export const PAYMENT_STATUS_COLORS = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800"
} as const;