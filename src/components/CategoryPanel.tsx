import { Plus } from 'lucide-react';
import type { GroupDraft } from '../types';

type CategoryPanelProps = {
  draft: GroupDraft;
  onAddGroup: () => void;
  onDraftChange: (draft: GroupDraft) => void;
};

export function CategoryPanel({ draft, onAddGroup, onDraftChange }: CategoryPanelProps) {
  return (
    <div className="panel setupPanel">
      <div className="sectionTitle">
        <Plus size={20} />
        <h2>Categorias</h2>
      </div>
      <div className="categoryForm">
        <input
          value={draft.name}
          onChange={(event) => onDraftChange({ ...draft, name: event.target.value })}
          placeholder="Nueva categoria, ej. Cervezas"
        />
        <input
          value={draft.description}
          onChange={(event) => onDraftChange({ ...draft, description: event.target.value })}
          placeholder="Descripcion opcional"
        />
        <button className="iconText" onClick={onAddGroup}>
          <Plus size={18} />
          Crear categoria
        </button>
      </div>
    </div>
  );
}
