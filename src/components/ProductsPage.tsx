import { ArrowLeft, Package } from 'lucide-react';
import type { Product } from '../types';
import { money } from '../utils/formatters';
import './ProductsPage.css';

type ProductsPageProps = {
  products: Product[];
  onBack: () => void;
};

export function ProductsPage({ products, onBack }: ProductsPageProps) {
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
            <b>{money(product.price)}</b>
            <small>{product.measure}</small>
            <small>Stock {product.stock}</small>
            <em>{product.isActive ? 'Activo' : 'Inactivo'}</em>
          </article>
        ))}
      </section>
    </main>
  );
}
