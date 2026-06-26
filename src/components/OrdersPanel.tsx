import { FileText } from 'lucide-react';
import { useState } from 'react';
import { API_ORIGIN } from '../services/restaurantApi';
import type { Order } from '../types';
import { money } from '../utils/formatters';
import { orderDestination } from '../utils/orders';
import './OrdersPanel.css';

type OrdersPanelProps = {
  orders: Order[];
  onUpdateStatus: (order: Order, status: Order['status']) => void;
};

export function OrdersPanel({ orders, onUpdateStatus }: OrdersPanelProps) {
  const [visibleCount, setVisibleCount] = useState(10);
  const visibleOrders = orders.slice(0, visibleCount);
  const hasMoreOrders = visibleCount < orders.length;

  return (
    <div className="panel">
      <div className="sectionTitle">
        <FileText size={20} />
        <h2>Pedidos recientes</h2>
      </div>
      <div className="orders">
        {visibleOrders.map((order) => (
          <article className="orderCard" key={order.id}>
            <div className="orderHeader">
              <strong>#{order.id} {orderDestination(order)}</strong>
              <span>{money(order.total)}</span>
            </div>
            <p>{order.items.map((item) => `${item.quantity} x ${item.productName}`).join(', ')}</p>
            {order.notes && <small>{order.notes}</small>}
            <div className="statusActions">
              <button
                onClick={() => onUpdateStatus(order, 'Open')}
                className={order.status === 'Open' ? 'selected' : ''}
                disabled={order.status === 'Paid' || order.status === 'Cancelled'}
              >
                Abierto
              </button>
              <button onClick={() => onUpdateStatus(order, 'Paid')} className={order.status === 'Paid' ? 'selected' : ''}>Pagado</button>
              <button onClick={() => onUpdateStatus(order, 'Cancelled')} className={order.status === 'Cancelled' ? 'selected' : ''}>Cancelado</button>
              <a className="invoiceLink" href={`${API_ORIGIN}${order.invoiceUrl}`} target="_blank">Factura PDF</a>
            </div>
          </article>
        ))}
        {hasMoreOrders && (
          <button className="loadMoreOrders" type="button" onClick={() => setVisibleCount((count) => count + 10)}>
            Cargar 10 pedidos mas
          </button>
        )}
      </div>
    </div>
  );
}
