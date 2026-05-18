import { History } from 'lucide-react';
import './Topbar.css';

type TopbarProps = {
  onOpenHistory: () => void;
};

export function Topbar({ onOpenHistory }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Restaurant local</p>
        <h1>Pedidos, productos y factura</h1>
      </div>
      <button className="iconText" onClick={onOpenHistory} title="Abrir historial">
        <History size={18} />
        Historial
      </button>
    </header>
  );
}
