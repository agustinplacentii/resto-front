import { Check, ShoppingCart, Trash2 } from 'lucide-react';
import type { CartItem } from '../types';
import { money } from '../utils/formatters';
import './CartPanel.css';

type CartPanelProps = {
  cart: CartItem[];
  notes: string;
  tableName: string;
  total: number;
  onNotesChange: (notes: string) => void;
  onSaveOrder: () => void;
  onTableNameChange: (tableName: string) => void;
  onUpdateCart: (productId: number, quantity: number) => void;
};

export function CartPanel({
  cart,
  notes,
  tableName,
  total,
  onNotesChange,
  onSaveOrder,
  onTableNameChange,
  onUpdateCart
}: CartPanelProps) {
  return (
    <aside className="panel cartPanel">
      <div className="sectionTitle">
        <ShoppingCart size={20} />
        <h2>Carrito</h2>
      </div>
      <label>
        Mesa o nombre
        <input value={tableName} onChange={(event) => onTableNameChange(event.target.value)} placeholder="Mesa 4" />
      </label>
      <label>
        Notas
        <textarea value={notes} onChange={(event) => onNotesChange(event.target.value)} placeholder="Sin cebolla, para llevar..." />
      </label>
      <div className="cartItems">
        {cart.length === 0 && <p className="muted">Todavia no hay productos en el carrito.</p>}
        {cart.map((item) => (
          <div className="cartItem" key={item.product.id}>
            <div>
              <strong>{item.product.name}</strong>
              <span>{item.product.measure} - {money(item.product.price)} c/u</span>
            </div>
            <input
              type="number"
              min="1"
              max={item.product.stock}
              value={item.quantity}
              onChange={(event) => onUpdateCart(item.product.id, Number(event.target.value))}
            />
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
      <button className="primary" onClick={onSaveOrder} disabled={cart.length === 0}>
        <Check size={18} />
        Guardar e imprimir
      </button>
    </aside>
  );
}
