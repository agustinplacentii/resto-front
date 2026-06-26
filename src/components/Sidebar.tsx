import { Boxes, ClipboardList, Home, Layers3, LogOut } from 'lucide-react';
import './Sidebar.css';

export type AppSection = 'home' | 'categories' | 'inventory' | 'orders';

type SidebarProps = {
  activeSection: AppSection;
  username: string;
  onLogout: () => void;
  onSectionChange: (section: AppSection) => void;
};

const items: { id: AppSection; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'categories', label: 'Categorias', icon: Layers3 },
  { id: 'inventory', label: 'Stock y precios', icon: Boxes },
  { id: 'orders', label: 'Pedidos recientes', icon: ClipboardList }
];

export function Sidebar({ activeSection, username, onLogout, onSectionChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebarBrand">
        <span>Saoko</span>
        <strong>Resto</strong>
      </div>
      <nav className="sidebarNav">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className={activeSection === item.id ? 'selected' : ''}
              key={item.id}
              type="button"
              onClick={() => onSectionChange(item.id)}
            >
              <Icon size={19} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="sidebarSession">
        <span>{username}</span>
        <button type="button" onClick={onLogout}>
          <LogOut size={19} />
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
