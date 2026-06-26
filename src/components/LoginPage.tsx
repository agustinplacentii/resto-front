import { FormEvent, useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import './LoginPage.css';

type LoginPageProps = {
  error: string;
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string) => Promise<void>;
};

export function LoginPage({ error, onLogin, onRegister }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await onLogin(username, password);
      } else {
        await onRegister(username, password);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="loginPage">
      <form className="loginPanel" onSubmit={submit}>
        <div className="loginIcon">
          <LockKeyhole size={26} />
        </div>
        <div>
          <p>Saoko Resto</p>
          <h1>{mode === 'login' ? 'Iniciar sesion' : 'Registrarse'}</h1>
        </div>

        <label>
          Usuario
          <input
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>

        <label>
          Contrasena
          <input
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error && <div className="loginError">{error}</div>}

        <button disabled={isSubmitting || !username.trim() || !password} type="submit">
          {isSubmitting ? 'Guardando...' : mode === 'login' ? 'Entrar' : 'Crear usuario'}
        </button>
        <button
          className="loginSecondary"
          type="button"
          onClick={() => setMode((current) => (current === 'login' ? 'register' : 'login'))}
        >
          {mode === 'login' ? 'Registrarse' : 'Ya tengo usuario'}
        </button>
      </form>
    </main>
  );
}
