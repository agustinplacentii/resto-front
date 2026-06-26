import { Check, Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { GroupDraft, ProductGroup } from '../types';
import './CategoryPanel.css';

type CategoryPanelProps = {
  draft: GroupDraft;
  groups: ProductGroup[];
  onAddGroup: () => void;
  onDraftChange: (draft: GroupDraft) => void;
  onUpdateGroup: (group: ProductGroup, draft: GroupDraft) => Promise<boolean>;
};

export function CategoryPanel({ draft, groups, onAddGroup, onDraftChange, onUpdateGroup }: CategoryPanelProps) {
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState<GroupDraft>({ name: '', description: '' });

  function startEdit(group: ProductGroup) {
    setEditingGroupId(group.id);
    setEditingDraft({ name: group.name, description: group.description });
  }

  function cancelEdit() {
    setEditingGroupId(null);
    setEditingDraft({ name: '', description: '' });
  }

  async function saveEdit(group: ProductGroup) {
    const wasUpdated = await onUpdateGroup(group, editingDraft);
    if (wasUpdated) {
      cancelEdit();
    }
  }

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
      <div className="categoryDivider">
        <span>Categorias creadas</span>
      </div>
      <div className="categoryList">
        {groups.map((group) => {
          const isEditing = editingGroupId === group.id;

          return (
            <div className="categoryItem" key={group.id}>
              <div className="categoryFields">
                {isEditing ? (
                  <>
                    <input
                      value={editingDraft.name}
                      onChange={(event) => setEditingDraft({ ...editingDraft, name: event.target.value })}
                      placeholder="Nombre"
                    />
                    <input
                      value={editingDraft.description}
                      onChange={(event) => setEditingDraft({ ...editingDraft, description: event.target.value })}
                      placeholder="Descripcion"
                    />
                  </>
                ) : (
                  <>
                    <div>
                      <strong>{group.name}</strong>
                      <span>{group.productCount} productos</span>
                    </div>
                    <p>{group.description || 'Sin descripcion'}</p>
                  </>
                )}
              </div>
              <div className="categoryActions">
                {isEditing ? (
                  <>
                    <button className="iconOnly" aria-label="Guardar categoria" onClick={() => saveEdit(group)}>
                      <Check size={18} />
                    </button>
                    <button className="iconOnly secondary" aria-label="Cancelar edicion" onClick={cancelEdit}>
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <button className="secondary" onClick={() => startEdit(group)}>
                    Editar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
