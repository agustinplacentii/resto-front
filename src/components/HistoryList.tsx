import { FileText, PackageMinus, PackagePlus } from 'lucide-react';
import type { ActivityLog } from '../types';
import { historyTime } from '../utils/formatters';
import './HistoryList.css';

type HistoryListProps = {
  items: ActivityLog[];
};

function iconFor(type: ActivityLog['type']) {
  if (type === 'stock-added') {
    return <PackagePlus size={18} />;
  }

  if (type === 'stock-removed') {
    return <PackageMinus size={18} />;
  }

  return <FileText size={18} />;
}

export function HistoryList({ items }: HistoryListProps) {
  if (items.length === 0) {
    return <p className="muted">Todavia no hay movimientos registrados.</p>;
  }

  return (
    <div className="historyList">
      {items.map((item) => (
        <article className="historyItem" key={item.id}>
          <span className={`historyIcon ${item.type}`}>
            {iconFor(item.type)}
          </span>
          <div>
            <strong>{item.description}</strong>
            <time>{historyTime(item.createdAt)}</time>
          </div>
        </article>
      ))}
    </div>
  );
}
