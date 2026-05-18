import type { ActivityLog, GroupDraft, Order, Product, ProductDraft, ProductGroup } from '../types';

export const API_ORIGIN = 'http://localhost:5088';
export const API_URL = `${API_ORIGIN}/api`;

export type RestaurantData = {
  groups: ProductGroup[];
  products: Product[];
  allProducts: Product[];
  orders: Order[];
};

async function parseError(response: Response, fallback: string) {
  const error = await response.json().catch(() => null);
  return error?.message ?? fallback;
}

export async function getRestaurantData(groupId?: number): Promise<RestaurantData> {
  const [groupsResponse, productsResponse, allProductsResponse, ordersResponse] = await Promise.all([
    fetch(`${API_URL}/products/groups`),
    fetch(groupId ? `${API_URL}/products?groupId=${groupId}` : `${API_URL}/products`),
    fetch(`${API_URL}/products`),
    fetch(`${API_URL}/orders`)
  ]);

  return {
    groups: await groupsResponse.json(),
    products: await productsResponse.json(),
    allProducts: await allProductsResponse.json(),
    orders: await ordersResponse.json()
  };
}

export async function getProductsByGroup(groupId: number) {
  const response = await fetch(`${API_URL}/products?groupId=${groupId}`);
  return response.json() as Promise<Product[]>;
}

export async function getProduct(productId: number) {
  const response = await fetch(`${API_URL}/products/${productId}`);
  return response.json() as Promise<Product>;
}

export async function createOrder(tableName: string, notes: string, items: { productId: number; quantity: number }[]) {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableName, notes, items })
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'No se pudo guardar el pedido.'));
  }

  return response.json() as Promise<Order>;
}

export async function updateProduct(product: Product) {
  await fetch(`${API_URL}/products/${product.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
}

export async function discountStock(productId: number, quantity: number, reason: 'courtesy' | 'damaged') {
  const response = await fetch(`${API_URL}/products/${productId}/stock-discounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity, reason })
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'No se pudo descontar stock.'));
  }

  return response.json() as Promise<Product>;
}

export async function createProduct(draft: ProductDraft, category: string) {
  await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...draft, category, isActive: true })
  });
}

export async function createGroup(groupDraft: GroupDraft) {
  const response = await fetch(`${API_URL}/products/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(groupDraft)
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'No se pudo crear la categoria.'));
  }

  return response.json() as Promise<ProductGroup>;
}

export async function updateOrderStatus(order: Order, status: Order['status']) {
  await fetch(`${API_URL}/orders/${order.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
}

export async function getHistory() {
  const response = await fetch(`${API_URL}/history`);
  return response.json() as Promise<ActivityLog[]>;
}
