import { Banknote, Check, X } from 'lucide-react';

type NoCashModalProps = {
  onCancel: () => void;
  onConfirmWithoutCash: () => void;
  onOpenCashAndSave: () => void;
};

export function NoCashModal({ onCancel, onConfirmWithoutCash, onOpenCashAndSave }: NoCashModalProps) {
  return (
    <div className="modalOverlay" role="dialog" aria-modal="true" aria-labelledby="noCashTitle">
      <div className="modalPanel">
        <h2 id="noCashTitle">No hay caja abierta</h2>
        <p>Si confirmas igual, el pedido se guarda e imprime pero no queda registrado en una caja.</p>
        <div className="modalActions">
          <button className="iconText" type="button" onClick={onCancel}>
            <X size={17} />
            Volver
          </button>
          <button className="iconText" type="button" onClick={onConfirmWithoutCash}>
            <Check size={17} />
            Confirmar igual
          </button>
          <button className="primary modalPrimary" type="button" onClick={onOpenCashAndSave}>
            <Banknote size={18} />
            Abrir caja y guardar
          </button>
        </div>
      </div>
    </div>
  );
}
