import { ArrowLeft, Banknote, LockKeyhole, UnlockKeyhole } from 'lucide-react';
import { useState } from 'react';
import type { CashRegister } from '../types';
import { dateTimeInputValue, historyTime, money } from '../utils/formatters';
import { orderDestination } from '../utils/orders';
import './CashPage.css';

type CashPageProps = {
  closedCashRegisters: CashRegister[];
  currentCashRegister: CashRegister | null;
  openingDateTime: string;
  onBack: () => void;
  onCloseCashRegister: () => void;
  onOpenCashRegister: () => void;
  onOpeningDateTimeChange: (value: string) => void;
};

function PaidOrdersDetail({ cashRegister }: { cashRegister: CashRegister }) {
  return (
    <div className="cashDetailStack">
      <div className="cashTotalBox">
        <span>Total cobrado</span>
        <strong>{money(cashRegister.total)}</strong>
      </div>

      <section className="cashItemsSummary">
        <h3>Detalle por producto</h3>
        {cashRegister.itemSummaries.length === 0 && <p className="muted">Todavia no hay productos cobrados en esta caja.</p>}
        {cashRegister.itemSummaries.map((item) => (
          <div className="cashItemSummary" key={item.productId}>
            <div>
              <strong>{item.productName}</strong>
              <span>{item.measure}</span>
            </div>
            <span>{item.quantity}</span>
            <strong>{money(item.total)}</strong>
          </div>
        ))}
      </section>

      <section className="cashOrders">
        <h3>Pedidos cobrados</h3>
        {cashRegister.paidOrders.length === 0 && <p className="muted">No hay pedidos cobrados en esta caja.</p>}
        {cashRegister.paidOrders.map((order) => (
          <article className="cashOrder" key={order.id}>
            <div>
              <strong>Pedido #{order.id} {orderDestination(order)}</strong>
              <span>{order.paidAt ? historyTime(order.paidAt) : historyTime(order.createdAt)}</span>
            </div>
            <p>{order.items.map((item) => `${item.quantity} x ${item.productName}`).join(', ')}</p>
            <strong>{money(order.total)}</strong>
          </article>
        ))}
      </section>
    </div>
  );
}

export function CashPage({
  closedCashRegisters,
  currentCashRegister,
  openingDateTime,
  onBack,
  onCloseCashRegister,
  onOpenCashRegister,
  onOpeningDateTimeChange
}: CashPageProps) {
  const [visibleClosedCount, setVisibleClosedCount] = useState(5);
  const visibleClosedCashRegisters = closedCashRegisters.slice(0, visibleClosedCount);
  const hasMoreClosedCashRegisters = visibleClosedCount < closedCashRegisters.length;

  return (
    <main className="cashPage">
      <header className="cashPageHeader">
        <button className="backButton" onClick={onBack}>
          <ArrowLeft size={18} />
          Volver
        </button>
        <div>
          <p className="eyebrow">Saoko</p>
          <h1>Caja</h1>
        </div>
      </header>

      <section className="cashGrid">
        <div className="panel cashControl">
          <div className="sectionTitle">
            <Banknote size={20} />
            <h2>{currentCashRegister ? 'Caja abierta' : 'Abrir caja'}</h2>
          </div>

          {currentCashRegister ? (
            <>
              <div className="cashSummary">
                <span>Desde</span>
                <strong>{historyTime(currentCashRegister.openedAt)}</strong>
                <span>Pedidos cobrados</span>
                <strong>{currentCashRegister.paidOrders.length}</strong>
                <span>Total actual</span>
                <strong>{money(currentCashRegister.total)}</strong>
              </div>
              <button className="primary danger" onClick={onCloseCashRegister}>
                <LockKeyhole size={18} />
                Finalizar caja
              </button>
            </>
          ) : (
            <>
              <label>
                Fecha y hora desde
                <input
                  max={dateTimeInputValue()}
                  type="datetime-local"
                  value={openingDateTime}
                  onChange={(event) => onOpeningDateTimeChange(event.target.value)}
                />
              </label>
              <button className="primary" onClick={onOpenCashRegister}>
                <UnlockKeyhole size={18} />
                Abrir caja
              </button>
            </>
          )}
        </div>

        <div className="panel cashDetail">
          <div className="sectionTitle">
            <Banknote size={20} />
            <h2>Detalle de cobros</h2>
          </div>
          {currentCashRegister ? (
            <PaidOrdersDetail cashRegister={currentCashRegister} />
          ) : (
            <p className="muted">Abri una caja para ver aca los pedidos que se vayan cobrando.</p>
          )}
        </div>
      </section>

      <section className="panel closedCashPanel">
        <div className="sectionTitle">
          <LockKeyhole size={20} />
          <h2>Cajas cerradas</h2>
        </div>
        <div className="closedCashList">
          {closedCashRegisters.length === 0 && <p className="muted">Todavia no hay cierres de caja.</p>}
          {visibleClosedCashRegisters.map((cashRegister) => (
            <details className="closedCashItem" key={cashRegister.id}>
              <summary>
                <span>#{cashRegister.id} - {historyTime(cashRegister.openedAt)} a {cashRegister.closedAt ? historyTime(cashRegister.closedAt) : 'abierta'}</span>
                <strong>{money(cashRegister.total)}</strong>
              </summary>
              <PaidOrdersDetail cashRegister={cashRegister} />
            </details>
          ))}
          {hasMoreClosedCashRegisters && (
            <button className="loadMoreClosedCash" type="button" onClick={() => setVisibleClosedCount((count) => count + 5)}>
              Cargar 5 cajas mas
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
