import { List, MinusCircle, Package, Plus, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
  stockAdditions: Record<number, number>;
  stockDiscounts: Record<number, StockDiscountDraft>;
  onAddProduct: () => void;
  onDeleteProduct: (product: Product) => void;
  onDraftChange: (draft: ProductDraft) => void;
  onOpenProducts: () => void;
  onStockAddition: (product: Product) => void;
  onStockAdditionChange: (productId: number, quantity: number) => void;
  onStockDiscount: (product: Product) => void;
  onStockDiscountChange: (productId: number, draft: StockDiscountDraft) => void;
};

export function InventoryPanel({
  draft,
  groups,
  products,
  stockAdditions,
  stockDiscounts,
  onAddProduct,
  onDeleteProduct,
  onDraftChange,
  onOpenProducts,
  onStockAddition,
  onStockAdditionChange,
  onStockDiscount,
  onStockDiscountChange
}: InventoryPanelProps) {
  const [mode, setMode] = useState<'new-product' | 'stock'>('new-product');
  const [stockSearch, setStockSearch] = useState('');
  const [focusedDraftField, setFocusedDraftField] = useState<'price' | 'stock' | null>(null);
  const availableProducts = useMemo(() => products.filter((product) => product.isActive), [products]);
  const matchedProducts = useMemo(() => {
    const search = stockSearch.trim().toLocaleLowerCase();
    if (!search) {
      return availableProducts;
    }

    return availableProducts.filter((product) =>
      `${product.name} ${product.category} ${product.productGroupName ?? ''}`.toLocaleLowerCase().includes(search)
    );
  }, [availableProducts, stockSearch]);
  const [selectedStockProductId, setSelectedStockProductId] = useState(availableProducts[0]?.id ?? 0);
  const selectedStockProduct = availableProducts.find((product) => product.id === selectedStockProductId) ?? matchedProducts[0];
  const selectedStockQuantity = selectedStockProduct ? stockAdditions[selectedStockProduct.id] ?? 1 : 1;
  const selectedStockDiscount = selectedStockProduct ? stockDiscounts[selectedStockProduct.id] ?? { quantity: 1, reason: 'courtesy' as const } : null;

  useEffect(() => {
    if (!matchedProducts.some((product) => product.id === selectedStockProductId)) {
      setSelectedStockProductId(matchedProducts[0]?.id ?? 0);
    }
  }, [matchedProducts, selectedStockProductId]);

  function selectStockProduct(productId: number) {
    setSelectedStockProductId(productId);
    onStockAdditionChange(productId, stockAdditions[productId] ?? 1);
    onStockDiscountChange(productId, stockDiscounts[productId] ?? { quantity: 1, reason: 'courtesy' });
  }

  return (
    <div className="panel">
      <div className="inventoryHeader">
        <div className="sectionTitle">
          <Package size={20} />
          <h2>Stock y precios</h2>
        </div>
        <button className="iconText" onClick={onOpenProducts}>
          <List size={18} />
          Ver productos
        </button>
      </div>

      <div className="inventoryModes">
        <button
          className={mode === 'new-product' ? 'selected' : ''}
          type="button"
          onClick={() => setMode('new-product')}
        >
          <Plus size={18} />
          Cargar nuevo producto
        </button>
        <button
          className={mode === 'stock' ? 'selected' : ''}
          type="button"
          onClick={() => setMode('stock')}
        >
          <PlusCircle size={18} />
          Stock de producto
        </button>
      </div>

      {mode === 'new-product' && (
        <div className="inventoryRow inventoryForm">
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
            <span>Precio</span>
            <input
              type="number"
              value={focusedDraftField === 'price' && draft.price === 0 ? '' : draft.price}
              onBlur={() => setFocusedDraftField(null)}
              onChange={(event) => onDraftChange({ ...draft, price: Number(event.target.value) })}
              onFocus={() => setFocusedDraftField('price')}
              placeholder="Precio"
            />
          </label>
          <label className="field">
            <span>Stock inicial</span>
            <input
              type="number"
              value={focusedDraftField === 'stock' && draft.stock === 0 ? '' : draft.stock}
              onBlur={() => setFocusedDraftField(null)}
              onChange={(event) => onDraftChange({ ...draft, stock: Number(event.target.value) })}
              onFocus={() => setFocusedDraftField('stock')}
              placeholder="Stock"
            />
          </label>
          <button className="iconText" type="button" onClick={onAddProduct}>
            <Plus size={18} />
            Agregar
          </button>
        </div>
      )}

      {mode === 'stock' && (
        <div className="inventoryForm stockLoadForm">
          <label className="field stockSearchField">
            <span>Buscar producto</span>
            <input
              value={stockSearch}
              onChange={(event) => setStockSearch(event.target.value)}
              placeholder="Escribi para buscar..."
            />
          </label>
          <label className="field">
            <span>Producto disponible</span>
            <select
              value={selectedStockProduct?.id ?? 0}
              onChange={(event) => selectStockProduct(Number(event.target.value))}
            >
              {matchedProducts.length === 0 && <option value={0}>Sin productos disponibles</option>}
              {matchedProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - stock actual {product.stock}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Cantidad a cargar</span>
            <input
              type="number"
              min="1"
              value={selectedStockQuantity}
              onChange={(event) => selectedStockProduct && onStockAdditionChange(selectedStockProduct.id, Number(event.target.value))}
            />
          </label>
          <button
            className="iconText stockMoveButton"
            type="button"
            onClick={() => selectedStockProduct && onStockAddition(selectedStockProduct)}
            disabled={!selectedStockProduct}
          >
            <PlusCircle size={18} />
            Cargar stock
          </button>
          <label className="field">
            <span>Cantidad a quitar</span>
            <input
              type="number"
              min="1"
              max={selectedStockProduct?.stock ?? 1}
              value={selectedStockDiscount?.quantity ?? 1}
              onChange={(event) =>
                selectedStockProduct &&
                selectedStockDiscount &&
                onStockDiscountChange(selectedStockProduct.id, {
                  ...selectedStockDiscount,
                  quantity: Number(event.target.value)
                })
              }
            />
          </label>
          <label className="field">
            <span>Motivo</span>
            <select
              value={selectedStockDiscount?.reason ?? 'courtesy'}
              onChange={(event) =>
                selectedStockProduct &&
                selectedStockDiscount &&
                onStockDiscountChange(selectedStockProduct.id, {
                  ...selectedStockDiscount,
                  reason: event.target.value as StockDiscountDraft['reason']
                })
              }
            >
              <option value="courtesy">Cortesia</option>
              <option value="damaged">Producto danado</option>
            </select>
          </label>
          <button
            className="iconText stockDiscountButton"
            type="button"
            onClick={() => selectedStockProduct && onStockDiscount(selectedStockProduct)}
            disabled={!selectedStockProduct || selectedStockProduct.stock <= 0}
          >
            <MinusCircle size={18} />
            Quitar stock
          </button>
          <button
            className="iconText deleteButton"
            type="button"
            onClick={() => selectedStockProduct && onDeleteProduct(selectedStockProduct)}
            disabled={!selectedStockProduct || selectedStockProduct.stock > 0}
            title={selectedStockProduct?.stock ? 'Solo se puede eliminar sin stock' : 'Eliminar producto'}
          >
            <Trash2 size={18} />
            Eliminar producto
          </button>
        </div>
      )}
    </div>
  );
}
