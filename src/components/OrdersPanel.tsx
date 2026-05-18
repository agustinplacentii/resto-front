import { FileText } from 'lucide-react';
import { API_ORIGIN } from '../services/restaurantApi';
import type { Order } from '../types';
import { money } from '../utils/formatters';

type OrdersPanelProps = {
  orders: Order[];
  onUpdateStatus: (order: Order, status: Order['status']) => void;
};

export function OrdersPanel({ orders, onUpdateStatus }: OrdersPanelProps) {
  return (
    <div className="panel">
      <div className="sectionTitle">
        <FileText size={20} />
        <h2>Pedidos recientes</h2>
      </div>
      <div className="orders">
        {orders.map((order) => (
          <article className="orderCard" key={order.id}>
            <div className="orderHeader">
              <strong>#{order.id} {order.tableName || 'Sin mesa'}</strong>
              <span>{money(order.total)}</span>
            </div>
            <p>{order.items.map((item) => `${item.quantity} x ${item.productName}`).join(', ')}</p>
            {order.notes && <small>{order.notes}</small>}
            <div className="statusActions">
              <button onClick={() => onUpdateStatus(order, 'Open')} className={order.status === 'Open' ? 'selected' : ''}>Abierto</button>
              <button onClick={() => onUpdateStatus(order, 'Paid')} className={order.status === 'Paid' ? 'selected' : ''}>Pagado</button>
              <button onClick={() => onUpdateStatus(order, 'Cancelled')} className={order.status === 'Cancelled' ? 'selected' : ''}>Cancelado</button>
              <a className="invoiceLink" href={`${API_ORIGIN}${order.invoiceUrl}`} target="_blank">Factura PDF</a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
