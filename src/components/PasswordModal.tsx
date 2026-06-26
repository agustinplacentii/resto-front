import { LockKeyhole } from 'lucide-react';
import { useState } from 'react';

type PasswordModalProps = {
  title: string;
  description: string;
  confirmLabel: string;
  error: string;
  onCancel: () => void;
  onConfirm: (password: string) => void;
};

export function PasswordModal({ title, description, confirmLabel, error, onCancel, onConfirm }: PasswordModalProps) {
  const [password, setPassword] = useState('');

  return (
    <div className="modalOverlay">
      <form
        className="modalPanel"
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm(password);
        }}
      >
        <div className="sectionTitle">
          <LockKeyhole size={20} />
          <h2>{title}</h2>
        </div>
        <p>{description}</p>
        <label>
          Contrasena
          <input
            autoFocus
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Contrasena"
          />
        </label>
        {error && <p className="modalError">{error}</p>}
        <div className="modalActions">
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button className="primary modalPrimary" type="submit">
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
