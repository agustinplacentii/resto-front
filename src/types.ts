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
  customerName: string;
  notes: string;
  total: number;
  status: 'Open' | 'Paid' | 'Cancelled';
  createdAt: string;
  paidAt: string | null;
  items: OrderItem[];
  invoiceUrl: string;
};

export type AccountSearchResult = {
  searchType: 'table' | 'customer';
  searchValue: string;
  total: number;
  orders: Order[];
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

export type ActivityLog = {
  id: number;
  type: 'stock-added' | 'stock-removed' | 'invoice-created' | string;
  description: string;
  createdAt: string;
};

export type CashRegister = {
  id: number;
  openedAt: string;
  closedAt: string | null;
  total: number;
  itemSummaries: CashRegisterItemSummary[];
  paidOrders: Order[];
};

export type CashRegisterItemSummary = {
  productId: number;
  productName: string;
  measure: string;
  quantity: number;
  total: number;
};

export type SessionUser = {
  id: number;
  username: string;
};
