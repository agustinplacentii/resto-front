import { ArrowLeft, Utensils } from 'lucide-react';
import type { Product, ProductGroup } from '../types';
import { money } from '../utils/formatters';

type MenuPanelProps = {
  groups: ProductGroup[];
  products: Product[];
  selectedGroup: ProductGroup | null;
  onBack: () => void;
  onOpenGroup: (group: ProductGroup) => void;
  onOpenProduct: (productId: number) => void;
};

export function MenuPanel({ groups, products, selectedGroup, onBack, onOpenGroup, onOpenProduct }: MenuPanelProps) {
  const activeProducts = products.filter((product) => product.isActive);

  return (
    <div className="panel menuPanel">
      <div className="sectionTitle">
        <Utensils size={20} />
        <h2>{selectedGroup ? selectedGroup.name : 'Categorias'}</h2>
      </div>

      {selectedGroup ? (
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
              <button className="productButton" key={product.id} onClick={() => onOpenProduct(product.id)}>
                <strong>{product.name}</strong>
                <span>{product.measure}</span>
                <b>{money(product.price)}</b>
                <small>Stock {product.stock}</small>
              </button>
            ))}
          </div>
        </>
      ) : (
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
      )}
    </div>
  );
}
