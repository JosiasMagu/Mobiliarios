export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "mpesa" | "cartao" | "cash" | "transfer";

export interface OrderItem {
  productId: string | number;
  name: string;
  qty: number;
  price: number; // preço unitário
}

export interface Address {
  street: string;
  city: string;
  province?: string;
  zip?: string;
  notes?: string;
}

export interface Customer {
  id?: string | number;
  name?: string;
  email?: string;
  phone?: string;
}

export interface OrderHistory {
  at: string;              // ISO
  status: OrderStatus;
  note?: string;
}

export interface Order {
  id: string;              // string consistente no admin
  number: string;          // ex.: "#1023"
  customer: Customer;
  createdAt: string;       // ISO
  updatedAt: string;       // ISO
  status: OrderStatus;
  total: number;           // total do pedido
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  history: OrderHistory[];
}
