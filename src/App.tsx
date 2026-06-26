import { useEffect, useMemo, useState } from 'react';
import { CashPage } from './components/CashPage';
import { CartPanel } from './components/CartPanel';
import { CategoryPanel } from './components/CategoryPanel';
import { HistoryDrawer } from './components/HistoryDrawer';
import { HistoryPage } from './components/HistoryPage';
import { InventoryPanel } from './components/InventoryPanel';
import { LoginPage } from './components/LoginPage';
import { MenuPanel } from './components/MenuPanel';
import { NoCashModal } from './components/NoCashModal';
import { OrderDestinationPanel } from './components/OrderDestinationPanel';
import { OrdersPanel } from './components/OrdersPanel';
import { AccountSearchPanel } from './components/AccountSearchPanel';
import { PasswordModal } from './components/PasswordModal';
import { ProductsPage } from './components/ProductsPage';
import { Sidebar, type AppSection } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import './App.css';
import {
  API_URL,
  addStock,
  closeCashRegister,
  createGroup,
  createOrder,
  createProduct,
  deleteProduct,
  discountStock,
  getClosedCashRegisters,
  getCurrentCashRegister,
  getHistory,
  getProductsByGroup,
  getRestaurantData,
  login,
  openCashRegister,
  register,
  searchOpenAccount,
  updateGroup,
  updateOrderStatus,
  updateProduct,
} from './services/restaurantApi';
import { dateTimeInputValue } from './utils/formatters';
import type { AccountSearchResult, ActivityLog, CartItem, CashRegister, GroupDraft, Order, Product, ProductDraft, ProductGroup, SessionUser } from './types';

const emptyGroupDraft: GroupDraft = { name: '', description: '' };
const SESSION_USER_KEY = 'restoApp.sessionUser';
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

function getStoredSessionUser() {
  const rawUser = window.sessionStorage.getItem(SESSION_USER_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as SessionUser;
  } catch {
    window.sessionStorage.removeItem(SESSION_USER_KEY);
    return null;
  }
}

export function App() {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(() => getStoredSessionUser());
  const [loginError, setLoginError] = useState('');
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderDestinationType, setOrderDestinationType] = useState<'table' | 'name'>('table');
  const [tableName, setTableName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [payNow, setPayNow] = useState(false);
  const [message, setMessage] = useState('');
  const [groupDraft, setGroupDraft] = useState<GroupDraft>(emptyGroupDraft);
  const [draft, setDraft] = useState<ProductDraft>(emptyProductDraft);
  const [stockAdditions, setStockAdditions] = useState<Record<number, number>>({});
  const [stockDiscounts, setStockDiscounts] = useState<Record<number, StockDiscountDraft>>({});
  const [history, setHistory] = useState<ActivityLog[]>([]);
  const [currentCashRegister, setCurrentCashRegister] = useState<CashRegister | null>(null);
  const [closedCashRegisters, setClosedCashRegisters] = useState<CashRegister[]>([]);
  const [openingDateTime, setOpeningDateTime] = useState(dateTimeInputValue());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoryPage, setIsHistoryPage] = useState(false);
  const [isProductsPage, setIsProductsPage] = useState(false);
  const [isCashPage, setIsCashPage] = useState(false);
  const [isNoCashModalOpen, setIsNoCashModalOpen] = useState(false);
  const [accountSearchType, setAccountSearchType] = useState<'table' | 'customer'>('table');
  const [accountSearchValue, setAccountSearchValue] = useState('');
  const [accountSearchResult, setAccountSearchResult] = useState<AccountSearchResult | null>(null);
  const [pendingPaidOrder, setPendingPaidOrder] = useState<Order | null>(null);
  const [pendingPriceEdit, setPendingPriceEdit] = useState<{ product: Product; price: number } | null>(null);
  const [pendingCategoryEdit, setPendingCategoryEdit] = useState<{ product: Product; categoryName: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [passwordError, setPasswordError] = useState('');
  const [activeSection, setActiveSection] = useState<AppSection>('home');
  const [stockToast, setStockToast] = useState('');

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cart]);
  const hasOrderDestination =
    orderDestinationType === 'table' ? tableName.trim().length > 0 : customerName.trim().length > 0;

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
    if (!sessionUser) {
      return;
    }

    Promise.all([loadData(), loadHistory(), loadCashRegisters()]).catch(() => setMessage('No pude conectar con la API. Revisa que el backend este corriendo.'));
  }, [sessionUser]);

  useEffect(() => {
    if (!stockToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setStockToast(''), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [stockToast]);

  async function loadHistory() {
    setHistory(await getHistory());
  }

  async function loadCashRegisters() {
    const [current, closed] = await Promise.all([getCurrentCashRegister(), getClosedCashRegisters()]);
    setCurrentCashRegister(current);
    setClosedCashRegisters(closed);
  }

  async function handleLogin(username: string, password: string) {
    setLoginError('');

    try {
      const user = await login(username, password);
      window.sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
      setSessionUser(user);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'No se pudo iniciar sesion.');
    }
  }

  async function handleRegister(username: string, password: string) {
    setLoginError('');

    try {
      const user = await register(username, password);
      window.sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
      setSessionUser(user);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'No se pudo crear el usuario.');
    }
  }

  function handleLogout() {
    window.sessionStorage.removeItem(SESSION_USER_KEY);
    setSessionUser(null);
    setCart([]);
    setMessage('');
    setActiveSection('home');
  }

  async function openHistory() {
    await loadHistory();
    setIsHistoryOpen(true);
  }

  function openHistoryPage() {
    setIsHistoryOpen(false);
    setIsHistoryPage(true);
  }

  async function openCashPage() {
    setIsCashPage(true);
    setOpeningDateTime(dateTimeInputValue());
    await loadCashRegisters();
  }

  async function openGroup(group: ProductGroup) {
    setSelectedGroup(group);
    setMessage('');
    setProducts(await getProductsByGroup(group.id));
  }

  function closeGroup() {
    setSelectedGroup(null);
  }

  function changeOrderDestinationType(type: 'table' | 'name') {
    setOrderDestinationType(type);
    setAccountSearchType(type === 'table' ? 'table' : 'customer');
    setAccountSearchValue(type === 'table' ? tableName : customerName);
  }

  function changeTableName(value: string, searchAutomatically = false) {
    setTableName(value);
    setAccountSearchType('table');
    setAccountSearchValue(value);

    if (searchAutomatically) {
      if (value.trim()) {
        void searchAccountFor('table', value);
      } else {
        setAccountSearchResult(null);
      }
    }
  }

  function changeCustomerName(value: string) {
    setCustomerName(value);
    setAccountSearchType('customer');
    setAccountSearchValue(value);
  }

  async function searchAccountFor(searchType: 'table' | 'customer', searchValue: string) {
    setMessage('');

    setAccountSearchType(searchType);
    setAccountSearchValue(searchValue);

    try {
      const result = await searchOpenAccount(searchType, searchValue);
      setAccountSearchResult(result);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo buscar la cuenta.');
    }
  }

  async function searchAccount() {
    const selectedType = orderDestinationType === 'table' ? 'table' : 'customer';
    const selectedValue = orderDestinationType === 'table' ? tableName : customerName;
    const searchType = accountSearchValue.trim() ? accountSearchType : selectedType;
    const searchValue = accountSearchValue.trim() ? accountSearchValue : selectedValue;

    await searchAccountFor(searchType, searchValue);
  }

  function addToCart(product: Product) {
    if (!hasOrderDestination) {
      setMessage('Selecciona una mesa o escribi un nombre antes de agregar productos.');
      return;
    }

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

  async function saveOrderWithoutCashCheck(payImmediately = payNow) {
    setMessage('');

    try {
      if (!hasOrderDestination) {
        setMessage('Selecciona una mesa o escribi un nombre para guardar el pedido.');
        return;
      }

      const order = await createOrder(
        orderDestinationType === 'table' ? tableName : '',
        orderDestinationType === 'name' ? customerName : '',
        '',
        payImmediately,
        cart.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
      );

      setCart([]);
      setTableName('');
      setCustomerName('');
      setOrderDestinationType('table');
      setPayNow(false);
      setMessage(`Pedido #${order.id} guardado. Ya podes imprimir la factura.`);
      await loadData(selectedGroup?.id);
      await loadHistory();
      await loadCashRegisters();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar el pedido.');
    }
  }

  async function saveOrder() {
    setMessage('');

    try {
      const current = await getCurrentCashRegister();
      setCurrentCashRegister(current);

      if (!current) {
        setIsNoCashModalOpen(true);
        return;
      }

      await saveOrderWithoutCashCheck();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo verificar la caja.');
    }
  }

  async function confirmOrderWithoutCash() {
    setIsNoCashModalOpen(false);
    await saveOrderWithoutCashCheck();
  }

  async function openCashAndSaveOrder() {
    setIsNoCashModalOpen(false);
    setMessage('');

    try {
      const cashRegister = await openCashRegister(dateTimeInputValue());
      setCurrentCashRegister(cashRegister);
      setOpeningDateTime(dateTimeInputValue());
      await saveOrderWithoutCashCheck(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo abrir la caja.');
    }
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
      setMessage(`${quantity} de ${product.name} agregado al stock.`);
      setStockToast(`${quantity} de ${product.name} agregado al stock.`);
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
        `${quantity} de ${product.name} descontado por ${
          current.reason === 'courtesy' ? 'cortesia de la casa' : 'producto danado'
        }.`
      );
      setStockToast(
        `${quantity} de ${product.name} descontado por ${
          current.reason === 'courtesy' ? 'cortesia de la casa' : 'producto danado'
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

  async function deleteProductFromInventory(product: Product) {
    try {
      await deleteProduct(product.id);
      setMessage(`Producto ${product.name} eliminado.`);
      setCart((items) => items.filter((item) => item.product.id !== product.id));
      await loadData(selectedGroup?.id);
      await loadHistory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo eliminar el producto.');
    }
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

  async function editGroup(group: ProductGroup, nextDraft: GroupDraft) {
    if (!nextDraft.name.trim()) {
      setMessage('Escribi el nombre de la categoria.');
      return false;
    }

    try {
      const updatedGroup = await updateGroup(group.id, nextDraft);
      setGroups((current) => current.map((item) => (item.id === updatedGroup.id ? updatedGroup : item)));
      setSelectedGroup((current) => (current?.id === updatedGroup.id ? updatedGroup : current));
      setMessage(`Categoria ${updatedGroup.name} actualizada.`);
      await loadData(selectedGroup?.id);
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo actualizar la categoria.');
      return false;
    }
  }

  async function updateStatus(order: Order, status: Order['status']) {
    if (status === 'Paid' && order.status !== 'Paid') {
      setPasswordError('');
      setPendingPaidOrder(order);
      return;
    }

    try {
      await updateOrderStatus(order, status);
      await loadData(selectedGroup?.id);
      await loadCashRegisters();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo actualizar el estado del pedido.');
    }
  }

  async function confirmPaidOrder(password: string) {
    if (!pendingPaidOrder || !sessionUser) {
      return;
    }

    try {
      await login(sessionUser.username, password);
    } catch {
      setPasswordError('La contrasena no coincide.');
      return;
    }

    try {
      await updateOrderStatus(pendingPaidOrder, 'Paid');
      setPendingPaidOrder(null);
      setPasswordError('');
      setMessage(`Pedido #${pendingPaidOrder.id} marcado como pagado.`);
      await loadData(selectedGroup?.id);
      await loadCashRegisters();
      if (accountSearchResult) {
        await searchAccount();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo actualizar el estado del pedido.');
    }
  }

  function requestPriceEdit(product: Product, price: number) {
    setPasswordError('');
    setPendingPriceEdit({ product, price });
  }

  async function confirmPriceEdit(password: string) {
    if (!pendingPriceEdit || !sessionUser) {
      return;
    }

    try {
      await login(sessionUser.username, password);
    } catch {
      setPasswordError('La contrasena no coincide.');
      return;
    }

    const { product, price } = pendingPriceEdit;

    try {
      await updateProduct({ ...product, price });
      setPendingPriceEdit(null);
      setPasswordError('');
      setMessage(`Precio de ${product.name} actualizado.`);
      setCart((items) =>
        items.map((item) => (item.product.id === product.id ? { ...item, product: { ...item.product, price } } : item))
      );
      await loadData(selectedGroup?.id);
      await loadHistory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo actualizar el precio.');
    }
  }

  function requestCategoryEdit(product: Product, categoryName: string) {
    setPasswordError('');
    setPendingCategoryEdit({ product, categoryName });
  }

  async function confirmCategoryEdit(password: string) {
    if (!pendingCategoryEdit || !sessionUser) {
      return;
    }

    try {
      await login(sessionUser.username, password);
    } catch {
      setPasswordError('La contrasena no coincide.');
      return;
    }

    const { product, categoryName } = pendingCategoryEdit;

    try {
      await updateProduct({ ...product, category: categoryName });
      setPendingCategoryEdit(null);
      setPasswordError('');
      setMessage(`Categoría de ${product.name} actualizada a ${categoryName}.`);
      await loadData(selectedGroup?.id);
      await loadHistory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo actualizar la categoría.');
    }
  }

  function requestProductDelete(product: Product) {
    if (product.stock > 0) {
      setMessage('No se puede eliminar un producto que tiene stock.');
      return;
    }
    setPasswordError('');
    setPendingDelete(product);
  }

  async function confirmProductDelete(password: string) {
    if (!pendingDelete || !sessionUser) {
      return;
    }

    try {
      await login(sessionUser.username, password);
    } catch {
      setPasswordError('La contrasena no coincide.');
      return;
    }

    const product = pendingDelete;

    try {
      await deleteProduct(product.id);
      setPendingDelete(null);
      setPasswordError('');
      setMessage(`Producto ${product.name} eliminado.`);
      await loadData(selectedGroup?.id);
      await loadHistory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo eliminar el producto.');
    }
  }

  async function startCashRegister() {
    try {
      const cashRegister = await openCashRegister(openingDateTime);
      setCurrentCashRegister(cashRegister);
      setMessage(`Caja abierta desde ${new Date(cashRegister.openedAt).toLocaleString('es-AR')}.`);
      await loadCashRegisters();
      await loadHistory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo abrir la caja.');
    }
  }

  async function finishCashRegister() {
    try {
      const cashRegister = await closeCashRegister();
      setCurrentCashRegister(null);
      setMessage(`Caja finalizada. Total cobrado: ${cashRegister.total}.`);
      await loadCashRegisters();
      await loadHistory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cerrar la caja.');
    }
  }

  if (!sessionUser) {
    return <LoginPage error={loginError} onLogin={handleLogin} onRegister={handleRegister} />;
  }

  if (isHistoryPage) {
    return <HistoryPage items={history} onBack={() => setIsHistoryPage(false)} />;
  }

  if (isProductsPage) {
    return (
      <>
        <ProductsPage 
          products={allProducts} 
          groups={groups}
          onBack={() => setIsProductsPage(false)} 
          onPriceEdit={requestPriceEdit}
          onCategoryEdit={requestCategoryEdit}
          onDelete={requestProductDelete}
        />
        {pendingPriceEdit && (
          <PasswordModal
            title="Cambiar precio"
            description={`Nuevo precio para ${pendingPriceEdit.product.name}: ${pendingPriceEdit.price}.`}
            confirmLabel="Actualizar precio"
            error={passwordError}
            onCancel={() => {
              setPendingPriceEdit(null);
              setPasswordError('');
            }}
            onConfirm={confirmPriceEdit}
          />
        )}
        {pendingCategoryEdit && (
          <PasswordModal
            title="Cambiar categoría"
            description={`Nueva categoría para ${pendingCategoryEdit.product.name}: ${pendingCategoryEdit.categoryName}.`}
            confirmLabel="Actualizar categoría"
            error={passwordError}
            onCancel={() => {
              setPendingCategoryEdit(null);
              setPasswordError('');
            }}
            onConfirm={confirmCategoryEdit}
          />
        )}
        {pendingDelete && (
          <PasswordModal
            title="Eliminar producto"
            description={`¿Estás seguro que deseas eliminar ${pendingDelete.name}? Esta acción no se puede deshacer.`}
            confirmLabel="Sí, eliminar"
            error={passwordError}
            onCancel={() => {
              setPendingDelete(null);
              setPasswordError('');
            }}
            onConfirm={confirmProductDelete}
          />
        )}
      </>
    );
  }

  if (isCashPage) {
    return (
      <CashPage
        closedCashRegisters={closedCashRegisters}
        currentCashRegister={currentCashRegister}
        openingDateTime={openingDateTime}
        onBack={() => setIsCashPage(false)}
        onCloseCashRegister={finishCashRegister}
        onOpenCashRegister={startCashRegister}
        onOpeningDateTimeChange={setOpeningDateTime}
      />
    );
  }

  return (
    <div className="appShell">
      <Sidebar activeSection={activeSection} username={sessionUser.username} onLogout={handleLogout} onSectionChange={setActiveSection} />
      <main>
        <Topbar onOpenCashRegister={openCashPage} onOpenHistory={openHistory} />

        {message && <div className="notice">{message}</div>}

      {isNoCashModalOpen && (
        <NoCashModal
          onCancel={() => setIsNoCashModalOpen(false)}
          onConfirmWithoutCash={confirmOrderWithoutCash}
          onOpenCashAndSave={openCashAndSaveOrder}
        />
      )}

      {pendingPaidOrder && (
        <PasswordModal
          title="Confirmar pago"
          description={`Para marcar el pedido #${pendingPaidOrder.id} como pagado, ingresa la contrasena.`}
          confirmLabel="Marcar pagado"
          error={passwordError}
          onCancel={() => {
            setPendingPaidOrder(null);
            setPasswordError('');
          }}
          onConfirm={confirmPaidOrder}
        />
      )}

      {pendingPriceEdit && (
        <PasswordModal
          title="Cambiar precio"
          description={`Nuevo precio para ${pendingPriceEdit.product.name}: ${pendingPriceEdit.price}.`}
          confirmLabel="Actualizar precio"
          error={passwordError}
          onCancel={() => {
            setPendingPriceEdit(null);
            setPasswordError('');
          }}
          onConfirm={confirmPriceEdit}
        />
      )}

        {activeSection === 'home' && (
          <>
            <AccountSearchPanel
              result={accountSearchResult}
              searchType={accountSearchType}
              searchValue={accountSearchValue}
              onSearch={searchAccount}
              onSearchTypeChange={setAccountSearchType}
              onSearchValueChange={setAccountSearchValue}
            />
            <section className="workArea">
              <OrderDestinationPanel
                customerName={customerName}
                orderDestinationType={orderDestinationType}
                orders={orders}
                tableName={tableName}
                onCustomerNameChange={changeCustomerName}
                onOrderDestinationTypeChange={changeOrderDestinationType}
                onTableNameChange={changeTableName}
              />
              <section className={`consumptionArea${hasOrderDestination ? '' : ' consumptionAreaDisabled'}`}>
                <MenuPanel
                  groups={groups}
                  allProducts={allProducts}
                  products={products}
                  selectedGroup={selectedGroup}
                  onBack={closeGroup}
                  onOpenGroup={openGroup}
                  onOpenProduct={addToCart}
                />
                <CartPanel
                  cart={cart}
                  isEnabled={hasOrderDestination}
                  payNow={payNow}
                  total={total}
                  onPayNowChange={setPayNow}
                  onSaveOrder={saveOrder}
                  onUpdateCart={updateCart}
                />
              </section>
            </section>
            <section className="homeOrders">
              <OrdersPanel orders={orders} onUpdateStatus={updateStatus} />
            </section>
          </>
        )}

        {activeSection === 'categories' && (
          <section className="sectionPage">
            <CategoryPanel
              draft={groupDraft}
              groups={groups}
              onAddGroup={addGroup}
              onDraftChange={setGroupDraft}
              onUpdateGroup={editGroup}
            />
          </section>
        )}

        {activeSection === 'inventory' && (
          <section className="sectionPage">
            <InventoryPanel
              draft={draft}
              groups={groups}
              products={allProducts}
              stockAdditions={stockAdditions}
              stockDiscounts={stockDiscounts}
              onAddProduct={addProduct}
              onDeleteProduct={deleteProductFromInventory}
              onDraftChange={setDraft}
              onOpenProducts={() => setIsProductsPage(true)}
              onStockAddition={addProductStock}
              onStockAdditionChange={updateStockAddition}
              onStockDiscount={removeStock}
              onStockDiscountChange={updateStockDiscount}
            />
          </section>
        )}

        {activeSection === 'orders' && (
          <section className="sectionPage">
            <OrdersPanel orders={orders} onUpdateStatus={updateStatus} />
          </section>
        )}

        <HistoryDrawer
          isOpen={isHistoryOpen}
          items={history}
          onClose={() => setIsHistoryOpen(false)}
          onOpenFullPage={openHistoryPage}
        />
        {stockToast && <div className="stockToast">{stockToast}</div>}
      </main>
    </div>
  );
}
