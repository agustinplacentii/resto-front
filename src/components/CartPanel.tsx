import { Check, Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '../types';
import { money } from '../utils/formatters';
import './CartPanel.css';

type CartPanelProps = {
  cart: CartItem[];
  isEnabled: boolean;
  payNow: boolean;
  total: number;
  onPayNowChange: (payNow: boolean) => void;
  onSaveOrder: () => void;
  onUpdateCart: (productId: number, quantity: number) => void;
};

export function CartPanel({
  cart,
  isEnabled,
  payNow,
  total,
  onPayNowChange,
  onSaveOrder,
  onUpdateCart
}: CartPanelProps) {
  return (
    <aside className="panel cartPanel">
      <label className="payNowOption">
        <input type="checkbox" checked={payNow} onChange={(event) => onPayNowChange(event.target.checked)} />
        Paga en el momento
      </label>
      <div className="cartItems">
        {!isEnabled && <p className="muted">Selecciona una mesa o escribi un nombre para empezar.</p>}
        {isEnabled && cart.length === 0 && <p className="muted">Hace click en un producto para sumarlo al pedido.</p>}
        {cart.map((item) => (
          <div className="cartItem" key={item.product.id}>
            <div>
              <strong>{item.product.name}</strong>
              <span>{item.product.measure} - {money(item.product.price)} c/u</span>
            </div>
            <div className="cartQuantity">
              <button
                className="iconOnly"
                type="button"
                onClick={() => onUpdateCart(item.product.id, item.quantity - 1)}
                title="Bajar cantidad"
              >
                <Minus size={16} />
              </button>
              <input
                aria-label={`Cantidad de ${item.product.name}`}
                type="number"
                min="1"
                max={item.product.stock}
                value={item.quantity}
                onChange={(event) => onUpdateCart(item.product.id, Number(event.target.value))}
              />
              <button
                className="iconOnly"
                type="button"
                onClick={() => onUpdateCart(item.product.id, item.quantity + 1)}
                disabled={item.quantity >= item.product.stock}
                title="Subir cantidad"
              >
                <Plus size={16} />
              </button>
            </div>
            <button className="iconOnly" onClick={() => onUpdateCart(item.product.id, 0)} title="Quitar">
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>
      <div className="totalRow">
        <span>Total</span>
        <strong>{money(total)}</strong>
      </div>
      <button className="primary" onClick={onSaveOrder} disabled={!isEnabled || cart.length === 0}>
        <Check size={18} />
        Guardar e imprimir
      </button>
    </aside>
  );
}
