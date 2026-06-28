import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { User } from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: () => () => {},
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../config/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/dashboard' }),
  Link: ({ children }: { children: React.ReactNode }) => children,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ element }: { element: React.ReactNode }) => element,
}));

vi.mock('../services/users.service', () => ({
  usersService: {
    getAll: () => Promise.resolve([
      { uid: '1', email: 'test@test.com', displayName: 'Test', disabled: false, creationTime: '', lastSignInTime: '', customClaims: {} },
    ]),
    getByUid: () => Promise.resolve({ uid: '1', email: 'test@test.com' }),
    update: () => Promise.resolve({ uid: '1', email: 'test@test.com' }),
    remove: () => Promise.resolve({ message: 'ok' }),
  },
}));

import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextValue } from '../contexts/AuthContext';

function wrapWithAuth(ui: React.ReactElement) {
  const value: AuthContextValue = {
    user: { uid: '1', email: 'test@test.com' } as unknown as User,
    loading: false,
    login: async () => {},
    logout: async () => {},
    register: async () => {},
  };
  return render(
    <AuthContext value={value}>
      {ui}
    </AuthContext>,
  );
}

describe('UsersPage', () => {
  it('muestra titulo y subtitulo', async () => {
    const { default: UsersPage } = await import('../pages/UsersPage');
    wrapWithAuth(<UsersPage />);
    expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
  });
});

describe('SettingsPage', () => {
  it('muestra titulo', async () => {
    const { default: SettingsPage } = await import('../pages/SettingsPage');
    wrapWithAuth(<SettingsPage />);
    expect(screen.getByText('Configuración del Sistema')).toBeInTheDocument();
  });

  it('muestra info del sistema', async () => {
    const { default: SettingsPage } = await import('../pages/SettingsPage');
    wrapWithAuth(<SettingsPage />);
    expect(screen.getByText('Versión')).toBeInTheDocument();
  });
});
