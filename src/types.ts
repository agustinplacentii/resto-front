export type ProductGroup = {
  id: number;
  name: string;
  description: string;
  productCount: number;
};

export type Product = {
  id: number;
  name: string;
  category: string;
  measure: string;
  price: number;
  stock: number;
  isActive: boolean;
  productGroupId: number | null;
  productGroupName: string | null;
};

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  measure: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Order = {
  id: number;
  tableName: string;
  notes: string;
  total: number;
  status: 'Open' | 'Paid' | 'Cancelled';
  createdAt: string;
  items: OrderItem[];
  invoiceUrl: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type ProductDraft = {
  name: string;
  measure: string;
  price: number;
  stock: number;
  productGroupId: number;
};

export type GroupDraft = {
  name: string;
  description: string;
};
