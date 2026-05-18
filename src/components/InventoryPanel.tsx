import { MinusCircle, Package, Plus } from 'lucide-react';
import type { Product, ProductDraft, ProductGroup } from '../types';
import './InventoryPanel.css';

type StockDiscountDraft = {
  quantity: number;
  reason: 'courtesy' | 'damaged';
};

type InventoryPanelProps = {
  draft: ProductDraft;
  groups: ProductGroup[];
  products: Product[];
  stockDiscounts: Record<number, StockDiscountDraft>;
  onAddProduct: () => void;
  onDraftChange: (draft: ProductDraft) => void;
  onSaveProduct: (product: Product) => void;
  onStockDiscount: (product: Product) => void;
  onStockDiscountChange: (productId: number, draft: StockDiscountDraft) => void;
};

export function InventoryPanel({
  draft,
  groups,
  products,
  stockDiscounts,
  onAddProduct,
  onDraftChange,
  onSaveProduct,
  onStockDiscount,
  onStockDiscountChange
}: InventoryPanelProps) {
  return (
    <div className="panel">
      <div className="sectionTitle">
        <Package size={20} />
        <h2>Stock y precios</h2>
      </div>
      <div className="inventory">
        {products.map((product) => (
          <article className="inventoryCard" key={product.id}>
            <div className="inventoryRow">
              <label className="field">
                <span>Producto</span>
                <input value={product.name} onChange={(event) => onSaveProduct({ ...product, name: event.target.value })} />
              </label>
              <label className="field">
                <span>Categoria</span>
                <select
                  value={product.productGroupId ?? 0}
                  onChange={(event) => {
                    const groupId = Number(event.target.value);
                    const group = groups.find((item) => item.id === groupId);
                    onSaveProduct({ ...product, productGroupId: groupId, category: group?.name ?? product.category });
                  }}
                >
                  <option value={0}>Sin categoria</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Medida</span>
                <input value={product.measure} onChange={(event) => onSaveProduct({ ...product, measure: event.target.value })} />
              </label>
              <label className="field">
                <span>Precio</span>
                <input type="number" value={product.price} onChange={(event) => onSaveProduct({ ...product, price: Number(event.target.value) })} />
              </label>
              <label className="field">
                <span>Stock</span>
                <input type="number" value={product.stock} onChange={(event) => onSaveProduct({ ...product, stock: Number(event.target.value) })} />
              </label>
              <label className="toggle field">
                <span>Estado</span>
                <input type="checkbox" checked={product.isActive} onChange={(event) => onSaveProduct({ ...product, isActive: event.target.checked })} />
                Activo
              </label>
            </div>
            <div className="stockDiscount">
              <label className="field">
                <span>Quitar</span>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={stockDiscounts[product.id]?.quantity ?? 1}
                  onChange={(event) => onStockDiscountChange(product.id, {
                    quantity: Number(event.target.value),
                    reason: stockDiscounts[product.id]?.reason ?? 'courtesy'
                  })}
                />
              </label>
              <label className="field">
                <span>Motivo</span>
                <select
                  value={stockDiscounts[product.id]?.reason ?? 'courtesy'}
                  onChange={(event) => onStockDiscountChange(product.id, {
                    quantity: stockDiscounts[product.id]?.quantity ?? 1,
                    reason: event.target.value as StockDiscountDraft['reason']
                  })}
                >
                  <option value="courtesy">Cortesia de la casa</option>
                  <option value="damaged">Producto dañado</option>
                </select>
              </label>
              <button className="iconText stockDiscountButton" onClick={() => onStockDiscount(product)} disabled={product.stock <= 0}>
                <MinusCircle size={18} />
                Quitar stock
              </button>
            </div>
          </article>
        ))}
        <div className="inventoryRow newProduct">
          <label className="field">
            <span>Producto</span>
            <input value={draft.name} onChange={(event) => onDraftChange({ ...draft, name: event.target.value })} placeholder="Nuevo producto" />
          </label>
          <label className="field">
            <span>Categoria</span>
            <select
              value={draft.productGroupId}
              onChange={(event) => onDraftChange({ ...draft, productGroupId: Number(event.target.value) })}
            >
              <option value={0}>Categoria</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Medida</span>
            <input value={draft.measure} onChange={(event) => onDraftChange({ ...draft, measure: event.target.value })} placeholder="Medida" />
          </label>
          <label className="field">
            <span>Precio</span>
            <input type="number" value={draft.price} onChange={(event) => onDraftChange({ ...draft, price: Number(event.target.value) })} placeholder="Precio" />
          </label>
          <label className="field">
            <span>Stock</span>
            <input type="number" value={draft.stock} onChange={(event) => onDraftChange({ ...draft, stock: Number(event.target.value) })} placeholder="Stock" />
          </label>
          <button className="iconText" onClick={onAddProduct}>
            <Plus size={18} />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
