import { Banknote, Clock3 } from 'lucide-react';
import './Topbar.css';

type TopbarProps = {
  onOpenCashRegister: () => void;
  onOpenHistory: () => void;
};

export function Topbar({ onOpenCashRegister, onOpenHistory }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Saoko</p>
        <h1>Pedidos, productos y factura</h1>
      </div>
      <div className="topbarActions">
        <button className="iconText" onClick={onOpenCashRegister} title="Abrir caja">
          <Banknote size={18} />
          Caja
        </button>
        <button className="iconText" onClick={onOpenHistory} title="Abrir historial">
          <Clock3 size={18} />
          Historial
        </button>
      </div>
    </header>
  );
}
