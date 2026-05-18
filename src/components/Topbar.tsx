import { RefreshCw } from 'lucide-react';

type TopbarProps = {
  onRefresh: () => void;
};

export function Topbar({ onRefresh }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Restaurant local</p>
        <h1>Pedidos, productos y factura</h1>
      </div>
      <button className="iconText" onClick={onRefresh} title="Actualizar datos">
        <RefreshCw size={18} />
        Actualizar
      </button>
    </header>
  );
}
