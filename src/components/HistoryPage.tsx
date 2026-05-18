import { ArrowLeft } from 'lucide-react';
import type { ActivityLog } from '../types';
import { HistoryList } from './HistoryList';
import './HistoryPage.css';

type HistoryPageProps = {
  items: ActivityLog[];
  onBack: () => void;
};

export function HistoryPage({ items, onBack }: HistoryPageProps) {
  return (
    <main className="historyPage">
      <header className="historyPageHeader">
        <button className="backButton" onClick={onBack}>
          <ArrowLeft size={18} />
          Volver
        </button>
        <div>
          <p className="eyebrow">Restaurant local</p>
          <h1>Historial completo</h1>
        </div>
      </header>
      <section className="panel historyPagePanel">
        <HistoryList items={items} />
      </section>
    </main>
  );
}
