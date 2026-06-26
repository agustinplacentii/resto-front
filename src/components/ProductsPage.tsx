import { ArrowLeft, DollarSign, Package } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '../types';
import { money } from '../utils/formatters';
import './ProductsPage.css';

type ProductsPageProps = {
  products: Product[];
  onBack: () => void;
  onPriceEdit: (product: Product, price: number) => void;
};

export function ProductsPage({ products, onBack, onPriceEdit }: ProductsPageProps) {
  const [priceDrafts, setPriceDrafts] = useState<Record<number, number>>({});

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
            <div className="productCatalogIcon">
              <Package size={20} />
            </div>
            <div>
              <strong>{product.name}</strong>
              <span>{product.productGroupName ?? (product.category || 'Sin categoria')}</span>
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
            </div>
            <small>Stock {product.stock}</small>
            <em>{product.isActive ? 'Activo' : 'Inactivo'}</em>
            <button
              className="iconText"
              type="button"
              onClick={() => onPriceEdit(product, priceDrafts[product.id] ?? product.price)}
              disabled={(priceDrafts[product.id] ?? product.price) === product.price || (priceDrafts[product.id] ?? 0) < 0}
            >
              <DollarSign size={17} />
              Cambiar
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
