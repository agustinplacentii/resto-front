import { ArrowLeft, Search, Utensils } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Product, ProductGroup } from '../types';
import { money } from '../utils/formatters';
import './MenuPanel.css';

type MenuPanelProps = {
  allProducts: Product[];
  groups: ProductGroup[];
  products: Product[];
  selectedGroup: ProductGroup | null;
  onBack: () => void;
  onOpenGroup: (group: ProductGroup) => void;
  onOpenProduct: (product: Product) => void;
};

export function MenuPanel({ allProducts, groups, products, selectedGroup, onBack, onOpenGroup, onOpenProduct }: MenuPanelProps) {
  const [productSearch, setProductSearch] = useState('');
  const activeProducts = products.filter((product) => product.isActive);
  const searchedProducts = useMemo(() => {
    const search = productSearch.trim().toLocaleLowerCase();
    if (!search) {
      return [];
    }

    return allProducts
      .filter((product) => product.isActive)
      .filter((product) =>
        `${product.name} ${product.category} ${product.productGroupName ?? ''}`.toLocaleLowerCase().includes(search)
      )
      .slice(0, 12);
  }, [allProducts, productSearch]);
  const isSearching = productSearch.trim().length > 0;

  return (
    <div className="panel menuPanel">
      <div className="sectionTitle">
        <Utensils size={20} />
        <h2>{selectedGroup ? selectedGroup.name : 'Categorias'}</h2>
      </div>

      <label className="menuSearch">
        <span>
          <Search size={16} />
          Buscar producto
        </span>
        <input
          value={productSearch}
          onChange={(event) => setProductSearch(event.target.value)}
          placeholder="Escribi para encontrar una card..."
        />
      </label>

      {isSearching && (
        <div className="productGrid searchProductGrid">
          {searchedProducts.length === 0 && <p className="muted">No encontre productos activos con ese texto.</p>}
          {searchedProducts.map((product) => (
            <button className="productButton" key={product.id} onClick={() => onOpenProduct(product)} disabled={product.stock <= 0}>
              <strong>{product.name}</strong>
              <span>{product.productGroupName ?? product.category}</span>
              <b>{money(product.price)}</b>
              <small>Stock {product.stock}</small>
            </button>
          ))}
        </div>
      )}

      {!isSearching && selectedGroup ? (
        <>
          <button className="backButton" onClick={onBack}>
            <ArrowLeft size={18} />
            Volver a categorias
          </button>
          <div className="productGrid">
            {activeProducts.length === 0 && (
              <p className="muted">Esta categoria todavia no tiene productos.</p>
            )}
            {activeProducts.map((product) => (
              <button className="productButton" key={product.id} onClick={() => onOpenProduct(product)} disabled={product.stock <= 0}>
                <strong>{product.name}</strong>
                <span>{product.measure}</span>
                <b>{money(product.price)}</b>
                <small>Stock {product.stock}</small>
              </button>
            ))}
          </div>
        </>
      ) : !isSearching ? (
        <div className="groupGrid">
          {groups.length === 0 && (
            <p className="muted">Crea categorias abajo para empezar a cargar productos.</p>
          )}
          {groups.map((group) => (
            <button className="groupCard" key={group.id} onClick={() => onOpenGroup(group)}>
              <strong>{group.name}</strong>
              <span>{group.description}</span>
              <small>{group.productCount} productos</small>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
