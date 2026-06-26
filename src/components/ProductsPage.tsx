import { ArrowLeft, DollarSign, Package, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Product, ProductGroup } from '../types';
import { money } from '../utils/formatters';
import './ProductsPage.css';

type ProductsPageProps = {
  products: Product[];
  groups: ProductGroup[];
  onBack: () => void;
  onPriceEdit: (product: Product, price: number) => void;
  onCategoryEdit: (product: Product, categoryName: string) => void;
  onDelete: (product: Product) => void;
};

export function ProductsPage({ products, groups, onBack, onPriceEdit, onCategoryEdit, onDelete }: ProductsPageProps) {
  const [priceDrafts, setPriceDrafts] = useState<Record<number, number>>({});
  const [categoryDrafts, setCategoryDrafts] = useState<Record<number, string>>({});

  return (
    <main className="productsPage">
      <header className="productsPageHeader">
        <button className="backButton" onClick={onBack}>
          <ArrowLeft size={18} />
          Volver
        </button>
        <div>
          <p className="eyebrow">Saoko</p>
          <h1>Todos los productos</h1>
        </div>
      </header>
      <section className="productsCatalog">
        {products.map((product) => (
          <article className="productCatalogCard" key={product.id}>
            <div className="productCatalogIconWithDelete">
              <div className="productCatalogIcon">
                <Package size={20} />
              </div>
              <button
                className="deleteBtn"
                type="button"
                onClick={() => onDelete(product)}
                disabled={product.stock > 0}
                title={product.stock > 0 ? 'No se puede eliminar productos con stock' : 'Eliminar producto'}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div>
              <strong>{product.name}</strong>
              <select
                className="categorySelector"
                value={categoryDrafts[product.id] ?? (product.productGroupName ?? product.category ?? '')}
                onChange={(event) => {
                  const newCategory = event.target.value;
                  setCategoryDrafts((current) => ({ ...current, [product.id]: newCategory }));
                  if (newCategory) {
                    const selectedGroup = groups.find((g) => g.name === newCategory);
                    if (selectedGroup) {
                      onCategoryEdit(product, newCategory);
                      setCategoryDrafts((current) => {
                        const { [product.id]: _, ...rest } = current;
                        return rest;
                      });
                    }
                  }
                }}
                title="Cambiar categoría del producto"
              >
                <option value="">Categoría</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.name}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="productPriceEditor">
              <b>{money(product.price)}</b>
              <input
                aria-label={`Precio de ${product.name}`}
                type="number"
                min="0"
                value={priceDrafts[product.id] ?? product.price}
                onChange={(event) =>
                  setPriceDrafts((current) => ({ ...current, [product.id]: Number(event.target.value) }))
                }
              />
              <button
                className="changePriceBtn"
                type="button"
                onClick={() => onPriceEdit(product, priceDrafts[product.id] ?? product.price)}
                disabled={(priceDrafts[product.id] ?? product.price) === product.price || (priceDrafts[product.id] ?? 0) < 0}
                title="Cambiar precio del producto"
              >
                <DollarSign size={14} />
                Cambiar precio
              </button>
            </div>
            <small>Stock {product.stock}</small>
            <em>{product.isActive ? 'Activo' : 'Inactivo'}</em>
          </article>
        ))}
      </section>
    </main>
  );
}
