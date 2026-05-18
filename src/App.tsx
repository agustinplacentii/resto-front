import { useEffect, useMemo, useState } from 'react';
import { CartPanel } from './components/CartPanel';
import { CategoryPanel } from './components/CategoryPanel';
import { HistoryDrawer } from './components/HistoryDrawer';
import { HistoryPage } from './components/HistoryPage';
import { InventoryPanel } from './components/InventoryPanel';
import { MenuPanel } from './components/MenuPanel';
import { OrdersPanel } from './components/OrdersPanel';
import { ProductDetailPanel } from './components/ProductDetailPanel';
import { ProductsPage } from './components/ProductsPage';
import { Topbar } from './components/Topbar';
import './App.css';
import {
  API_URL,
  addStock,
  createGroup,
  createOrder,
  createProduct,
  discountStock,
  getHistory,
  getProduct,
  getProductsByGroup,
  getRestaurantData,
  updateOrderStatus,
  updateProduct
} from './services/restaurantApi';
import type { ActivityLog, CartItem, GroupDraft, Order, Product, ProductDraft, ProductGroup } from './types';

const emptyGroupDraft: GroupDraft = { name: '', description: '' };
const emptyProductDraft: ProductDraft = {
  name: '',
  measure: 'Unidad',
  price: 0,
  stock: 0,
  productGroupId: 0
};

type StockDiscountDraft = {
  quantity: number;
  reason: 'courtesy' | 'damaged';
};

export function App() {
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableName, setTableName] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [groupDraft, setGroupDraft] = useState<GroupDraft>(emptyGroupDraft);
  const [draft, setDraft] = useState<ProductDraft>(emptyProductDraft);
  const [stockAdditions, setStockAdditions] = useState<Record<number, number>>({});
  const [stockDiscounts, setStockDiscounts] = useState<Record<number, StockDiscountDraft>>({});
  const [history, setHistory] = useState<ActivityLog[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoryPage, setIsHistoryPage] = useState(false);
  const [isProductsPage, setIsProductsPage] = useState(false);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cart]);

  async function loadData(groupId = selectedGroup?.id) {
    const data = await getRestaurantData(groupId);
    setGroups(data.groups);
    setProducts(data.products);
    setAllProducts(data.allProducts);
    setOrders(data.orders);

    if (draft.productGroupId === 0 && data.groups.length > 0) {
      setDraft((current) => ({ ...current, productGroupId: data.groups[0].id }));
    }
  }

  useEffect(() => {
    Promise.all([loadData(), loadHistory()]).catch(() => setMessage('No pude conectar con la API. Revisa que el backend este corriendo.'));
  }, []);

  async function loadHistory() {
    setHistory(await getHistory());
  }

  async function openHistory() {
    await loadHistory();
    setIsHistoryOpen(true);
  }

  function openHistoryPage() {
    setIsHistoryOpen(false);
    setIsHistoryPage(true);
  }

  async function openGroup(group: ProductGroup) {
    setSelectedGroup(group);
    setSelectedProduct(null);
    setMessage('');
    setProducts(await getProductsByGroup(group.id));
  }

  async function openProduct(productId: number) {
    setSelectedProduct(await getProduct(productId));
  }

  function closeGroup() {
    setSelectedGroup(null);
    setSelectedProduct(null);
  }

  function addToCart(product: Product) {
    if (!product.isActive || product.stock <= 0) {
      return;
    }

    setCart((items) => {
      const existing = items.find((item) => item.product.id === product.id);
      if (existing) {
        return items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }

      return [...items, { product, quantity: 1 }];
    });
  }

  function updateCart(productId: number, quantity: number) {
    if (quantity <= 0) {
      setCart((items) => items.filter((item) => item.product.id !== productId));
      return;
    }

    setCart((items) =>
      items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      )
    );
  }

  async function saveOrder() {
    setMessage('');

    try {
      const order = await createOrder(
        tableName,
        notes,
        cart.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
      );

      setCart([]);
      setTableName('');
      setNotes('');
      setMessage(`Pedido #${order.id} guardado. Ya podes imprimir la factura.`);
      await loadData(selectedGroup?.id);
      await loadHistory();
      window.open(`${API_URL}/orders/${order.id}/invoice.pdf`, '_blank');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar el pedido.');
    }
  }

  async function saveProduct(product: Product) {
    await updateProduct(product);
    await loadData(selectedGroup?.id);
    await loadHistory();
  }

  function updateStockDiscount(productId: number, discount: StockDiscountDraft) {
    setStockDiscounts((current) => ({
      ...current,
      [productId]: {
        quantity: Math.max(1, discount.quantity || 1),
        reason: discount.reason
      }
    }));
  }

  function updateStockAddition(productId: number, quantity: number) {
    setStockAdditions((current) => ({
      ...current,
      [productId]: Math.max(1, quantity || 1)
    }));
  }

  async function addProductStock(product: Product) {
    const quantity = Math.max(1, stockAdditions[product.id] ?? 1);

    try {
      await addStock(product.id, quantity);
      setMessage(`${quantity} ${product.measure} de ${product.name} agregado al stock.`);
      setStockAdditions((current) => ({
        ...current,
        [product.id]: 1
      }));
      await loadData(selectedGroup?.id);
      await loadHistory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo agregar stock.');
    }
  }

  async function removeStock(product: Product) {
    const current = stockDiscounts[product.id] ?? { quantity: 1, reason: 'courtesy' };
    const quantity = Math.max(1, Math.min(current.quantity, product.stock));

    try {
      await discountStock(product.id, quantity, current.reason);
      setMessage(
        `${quantity} ${product.measure} de ${product.name} descontado por ${
          current.reason === 'courtesy' ? 'cortesia de la casa' : 'producto dañado'
        }.`
      );
      setStockDiscounts((discounts) => ({
        ...discounts,
        [product.id]: { ...current, quantity: 1 }
      }));
      await loadData(selectedGroup?.id);
      await loadHistory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo descontar stock.');
    }
  }

  async function addProduct() {
    if (!draft.name.trim() || draft.productGroupId === 0) {
      setMessage('Crea o selecciona una categoria antes de guardar el producto.');
      return;
    }

    const group = groups.find((item) => item.id === draft.productGroupId);
    await createProduct(draft, group?.name ?? '');

    setDraft({
      ...emptyProductDraft,
      productGroupId: selectedGroup?.id ?? groups[0]?.id ?? 0
    });
    await loadData(selectedGroup?.id);
    await loadHistory();
  }

  async function addGroup() {
    if (!groupDraft.name.trim()) {
      setMessage('Escribi el nombre de la categoria.');
      return;
    }

    try {
      const group = await createGroup(groupDraft);
      setGroupDraft(emptyGroupDraft);
      setDraft((current) => ({ ...current, productGroupId: group.id }));
      setMessage(`Categoria ${group.name} creada.`);
      await loadData(group.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo crear la categoria.');
    }
  }

  async function updateStatus(order: Order, status: Order['status']) {
    await updateOrderStatus(order, status);
    await loadData(selectedGroup?.id);
  }

  if (isHistoryPage) {
    return <HistoryPage items={history} onBack={() => setIsHistoryPage(false)} />;
  }

  if (isProductsPage) {
    return <ProductsPage products={allProducts} onBack={() => setIsProductsPage(false)} />;
  }

  return (
    <main>
      <Topbar onOpenHistory={openHistory} />

      {message && <div className="notice">{message}</div>}

      <section className="workArea">
        <MenuPanel
          groups={groups}
          products={products}
          selectedGroup={selectedGroup}
          onBack={closeGroup}
          onOpenGroup={openGroup}
          onOpenProduct={openProduct}
        />
        <ProductDetailPanel product={selectedProduct} onAddToCart={addToCart} />
        <CartPanel
          cart={cart}
          notes={notes}
          tableName={tableName}
          total={total}
          onNotesChange={setNotes}
          onSaveOrder={saveOrder}
          onTableNameChange={setTableName}
          onUpdateCart={updateCart}
        />
      </section>

      <section className="lowerGrid">
        <CategoryPanel draft={groupDraft} onAddGroup={addGroup} onDraftChange={setGroupDraft} />
        <InventoryPanel
          draft={draft}
          groups={groups}
          products={allProducts}
          stockAdditions={stockAdditions}
          stockDiscounts={stockDiscounts}
          onAddProduct={addProduct}
          onDraftChange={setDraft}
          onOpenProducts={() => setIsProductsPage(true)}
          onSaveProduct={saveProduct}
          onStockAddition={addProductStock}
          onStockAdditionChange={updateStockAddition}
          onStockDiscount={removeStock}
          onStockDiscountChange={updateStockDiscount}
        />
        <OrdersPanel orders={orders} onUpdateStatus={updateStatus} />
      </section>

      <HistoryDrawer
        isOpen={isHistoryOpen}
        items={history}
        onClose={() => setIsHistoryOpen(false)}
        onOpenFullPage={openHistoryPage}
      />
    </main>
  );
}
