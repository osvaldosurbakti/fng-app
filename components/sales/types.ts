export interface MenuItem {
  name: string;
  price: number;
  category: "makanan" | "minuman";
}

export interface OrderItem {
  id: string;
  category: "makanan" | "minuman";
  menu: string;
  temperature?: "panas" | "dingin";
  quantity: number;
  price: number;
  notes?: string;
}

export interface CustomerInfo {
  name: string;
  phone?: string;
  notes?: string;
}