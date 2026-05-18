import { ArrowRight, ChevronUp, Maximize2, X } from 'lucide-react';
import type { ActivityLog } from '../types';
import { HistoryList } from './HistoryList';
import './HistoryDrawer.css';

type HistoryDrawerProps = {
  isOpen: boolean;
  items: ActivityLog[];
  onClose: () => void;
  onOpenFullPage: () => void;
};

export function HistoryDrawer({
  isOpen,
  items,
  onClose,
  onOpenFullPage
}: HistoryDrawerProps) {
  if (!isOpen) {
    return null;
  }

  const scrollToTop = () => {
    const drawer = document.querySelector('.historyDrawer');

    if (drawer) {
      drawer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="drawerLayer" role="presentation">
      <button
        className="drawerBackdrop"
        onClick={onClose}
        aria-label="Cerrar historial"
      />

      <aside className="historyDrawer" aria-label="Historial">
        <div className="drawerHeader">
          <div>
            <p className="eyebrow">Actividad</p>
            <h2>Historial</h2>
          </div>

          <button
            className="iconOnly"
            onClick={onClose}
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <button
          className="iconText drawerFullButton topButton"
          onClick={onOpenFullPage}
        >
          <Maximize2 size={18} />
          Ver historial completo
          <ArrowRight size={18} />
        </button>

        <HistoryList items={items.slice(0, 40)} />

        <button
          className="scrollTopButton"
          onClick={scrollToTop}
          title="Volver arriba"
        >
          <ChevronUp size={20} />
        </button>
      </aside>
    </div>
  );
}