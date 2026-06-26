import { ReceiptText, Search } from 'lucide-react';
import type { AccountSearchResult } from '../types';
import { historyTime, money } from '../utils/formatters';
import './AccountSearchPanel.css';

type AccountSearchPanelProps = {
  result: AccountSearchResult | null;
  searchType: 'table' | 'customer';
  searchValue: string;
  onSearch: () => void;
  onSearchTypeChange: (type: 'table' | 'customer') => void;
  onSearchValueChange: (value: string) => void;
};

export function AccountSearchPanel({
  result,
  searchType,
  searchValue,
  onSearch,
  onSearchTypeChange,
  onSearchValueChange
}: AccountSearchPanelProps) {
  return (
    <section className="panel accountSearch">
      <div className="accountSearchHeader">
        <div className="sectionTitle">
          <ReceiptText size={19} />
          <h2>Buscar cuenta</h2>
        </div>
        <button className="iconText" type="button" onClick={onSearch}>
          <Search size={17} />
          Buscar
        </button>
      </div>
      <div className="accountSearchControls">
        <div className="accountToggle">
          <button
            className={searchType === 'table' ? 'selected' : ''}
            type="button"
            onClick={() => onSearchTypeChange('table')}
          >
            Mesa
          </button>
          <button
            className={searchType === 'customer' ? 'selected' : ''}
            type="button"
            onClick={() => onSearchTypeChange('customer')}
          >
            Cliente
          </button>
        </div>
        <input
          value={searchValue}
          onChange={(event) => onSearchValueChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onSearch();
            }
          }}
          placeholder={searchType === 'table' ? 'Mesa 4' : 'Nombre del cliente'}
        />
      </div>
      {result && (
        <div className="accountResult">
          <div className="accountTotal">
            <span>{result.orders.length} pedidos abiertos</span>
            <strong>{money(result.total)}</strong>
          </div>
          {result.orders.length === 0 && <p className="muted">No hay pedidos abiertos para esa busqueda.</p>}
          {result.orders.map((order) => (
            <article className="accountOrder" key={order.id}>
              <div>
                <strong>Pedido #{order.id}</strong>
                <span>{historyTime(order.createdAt)}</span>
              </div>
              <p>{order.items.map((item) => `${item.quantity} x ${item.productName}`).join(', ')}</p>
              <b>{money(order.total)}</b>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
