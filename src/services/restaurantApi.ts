import type { AccountSearchResult, ActivityLog, CashRegister, GroupDraft, Order, Product, ProductDraft, ProductGroup, SessionUser } from '../types';

export const API_ORIGIN = '';
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

export async function login(username: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'No se pudo iniciar sesion.'));
  }

  return response.json() as Promise<SessionUser>;
}

export async function register(username: string, password: string) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'No se pudo crear el usuario.'));
  }

  return response.json() as Promise<SessionUser>;
}

export async function getProductsByGroup(groupId: number) {
  const response = await fetch(`${API_URL}/products?groupId=${groupId}`);
  return response.json() as Promise<Product[]>;
}

export async function getProduct(productId: number) {
  const response = await fetch(`${API_URL}/products/${productId}`);
  return response.json() as Promise<Product>;
}

export async function createOrder(
  tableName: string,
  customerName: string,
  notes: string,
  payNow: boolean,
  items: { productId: number; quantity: number }[]
) {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableName, customerName, notes, payNow, items })
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'No se pudo guardar el pedido.'));
  }

  return response.json() as Promise<Order>;
}

export async function updateProduct(product: Product) {
  const response = await fetch(`${API_URL}/products/${product.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'No se pudo actualizar el producto.'));
  }

  return response.json() as Promise<Product>;
}

export async function deleteProduct(productId: number) {
  const response = await fetch(`${API_URL}/products/${productId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'No se pudo eliminar el producto.'));
  }
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

export async function addStock(productId: number, quantity: number) {
  const response = await fetch(`${API_URL}/products/${productId}/stock-additions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity, reason: 'manual' })
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'No se pudo agregar stock.'));
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

export async function updateGroup(groupId: number, groupDraft: GroupDraft) {
  const response = await fetch(`${API_URL}/products/groups/${groupId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(groupDraft)
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'No se pudo actualizar la categoria.'));
  }

  return response.json() as Promise<ProductGroup>;
}

export async function updateOrderStatus(order: Order, status: Order['status']) {
  const response = await fetch(`${API_URL}/orders/${order.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'No se pudo actualizar el estado del pedido.'));
  }
}

export async function searchOpenAccount(searchType: 'table' | 'customer', searchValue: string) {
  const params = new URLSearchParams({ searchType, searchValue });
  const response = await fetch(`${API_URL}/orders/open-account?${params.toString()}`);

  if (!response.ok) {
    throw new Error(await parseError(response, 'No se pudo buscar la cuenta.'));
  }

  return response.json() as Promise<AccountSearchResult>;
}

export async function getHistory() {
  const response = await fetch(`${API_URL}/history`);
  return response.json() as Promise<ActivityLog[]>;
}

export async function getCurrentCashRegister() {
  const response = await fetch(`${API_URL}/cash-register/current`);
  const text = await response.text();
  return text ? JSON.parse(text) as CashRegister : null;
}

export async function getClosedCashRegisters() {
  const response = await fetch(`${API_URL}/cash-register/closed`);
  return response.json() as Promise<CashRegister[]>;
}

export async function openCashRegister(openedAt: string) {
  const response = await fetch(`${API_URL}/cash-register/open`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ openedAt: new Date(openedAt).toISOString() })
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'No se pudo abrir la caja.'));
  }

  return response.json() as Promise<CashRegister>;
}

export async function closeCashRegister() {
  const response = await fetch(`${API_URL}/cash-register/close`, {
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'No se pudo cerrar la caja.'));
  }

  return response.json() as Promise<CashRegister>;
}
