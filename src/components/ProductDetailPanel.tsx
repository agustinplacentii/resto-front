import { Package, Plus } from 'lucide-react';
import type { Product } from '../types';
import { money } from '../utils/formatters';
import './ProductDetailPanel.css';

type ProductDetailPanelProps = {
  product: Product | null;
  onAddToCart: (product: Product) => void;
};

export function ProductDetailPanel({ product, onAddToCart }: ProductDetailPanelProps) {
  return (
    <aside className="panel detailPanel">
      <div className="sectionTitle">
        <Package size={20} />
        <h2>Detalle</h2>
      </div>
      {product ? (
        <div className="productDetail">
          <p className="eyebrow">{product.productGroupName ?? product.category}</p>
          <h3>{product.name}</h3>
          <span>{product.measure}</span>
          <strong>{money(product.price)}</strong>
          <p>Stock disponible: {product.stock}</p>
          <button className="primary" onClick={() => onAddToCart(product)} disabled={product.stock <= 0}>
            <Plus size={18} />
            Sumar al carrito
          </button>
        </div>
      ) : (
        <p className="muted">Hace click en una categoria y despues en un producto para ver el detalle.</p>
      )}
    </aside>
  );
}
