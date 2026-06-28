import { useReducer, useCallback, useEffect } from 'react';
import { Users, Search, RefreshCw, Trash2, Shield, ShieldCheck, UserCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { usersService, type AppUser } from '../services/users.service';
import { useAuth } from '../hooks/useAuth';

interface UsersState {
  users: AppUser[];
  loading: boolean;
  error: string;
}

type UsersAction =
  | { type: 'fetch-start' }
  | { type: 'fetch-ok'; users: AppUser[] }
  | { type: 'fetch-error'; error: string }
  | { type: 'update-user'; user: AppUser }
  | { type: 'delete-user'; uid: string };

function reducer(state: UsersState, action: UsersAction): UsersState {
  switch (action.type) {
    case 'fetch-start':
      return { ...state, loading: true, error: '' };
    case 'fetch-ok':
      return { users: action.users, loading: false, error: '' };
    case 'fetch-error':
      return { ...state, loading: false, error: action.error };
    case 'update-user':
      return { ...state, users: state.users.map((x) => (x.uid === action.user.uid ? action.user : x)) };
    case 'delete-user':
      return { ...state, users: state.users.filter((x) => x.uid !== action.uid) };
  }
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [state, dispatch] = useReducer(reducer, { users: [], loading: true, error: '' });
  const [search, setSearch] = useReducer((_s: string, v: string) => v, '');
  const [confirmUid, setConfirmUid] = useReducer((_s: string | null, v: string | null) => v, null);

  const loadUsers = useCallback(async () => {
    dispatch({ type: 'fetch-start' });
    try {
      const data = await usersService.getAll();
      dispatch({ type: 'fetch-ok', users: data });
    } catch (err) {
      dispatch({ type: 'fetch-error', error: (err as Error).message });
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleToggleDisabled = async (u: AppUser) => {
    try {
      const updated = await usersService.update(u.uid, { disabled: !u.disabled });
      dispatch({ type: 'update-user', user: updated });
    } catch (err) {
      dispatch({ type: 'fetch-error', error: (err as Error).message });
    }
  };

  const handleToggleAdmin = async (u: AppUser) => {
    const currentRole = (u.customClaims?.role as string) || '';
    const newRole = currentRole === 'admin' ? '' : 'admin';
    try {
      const updated = await usersService.update(u.uid, { role: newRole });
      dispatch({ type: 'update-user', user: updated });
    } catch (err) {
      dispatch({ type: 'fetch-error', error: (err as Error).message });
    }
  };

  const handleDelete = async (uid: string) => {
    try {
      await usersService.remove(uid);
      dispatch({ type: 'delete-user', uid });
      setConfirmUid(null);
    } catch (err) {
      dispatch({ type: 'fetch-error', error: (err as Error).message });
    }
  };

  const { users, loading, error } = state;

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName.toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <div className="users-header-left">
          <Users size={20} style={{ color: 'var(--accent)' }} />
          <div>
            <h2 className="users-title">Gestión de Usuarios</h2>
            <p className="users-subtitle">{users.length} usuarios registrados</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={loadUsers} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="panel users-error">
          <span style={{ color: 'var(--danger)' }}>{error}</span>
          <button className="btn" onClick={() => dispatch({ type: 'fetch-ok', users })}>Cerrar</button>
        </div>
      )}

      <div className="users-toolbar">
        <div className="users-search">
          <Search size={14} />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por correo o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="users-loading">Cargando usuarios...</div>
      ) : filtered.length === 0 ? (
        <div className="users-empty">
          <UserCircle size={40} style={{ color: 'var(--text-muted)' }} />
          <p>{search ? 'Sin resultados para la búsqueda.' : 'No hay usuarios registrados.'}</p>
        </div>
      ) : (
        <div className="panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Último acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isAdmin = (u.customClaims?.role as string) === 'admin';
                const isSelf = u.uid === currentUser?.uid;

                return (
                  <tr key={u.uid}>
                    <td>
                      <div className="users-name-cell">
                        <div className="users-avatar-sm">
                          {(u.displayName || u.email)[0].toUpperCase()}
                        </div>
                        <span>{u.displayName || 'Sin nombre'}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                      {u.email}
                    </td>
                    <td>
                      <span className={`badge ${isAdmin ? 'badge-info' : 'badge-warning'}`}>
                        {isAdmin ? 'ADMIN' : 'OPERADOR'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.disabled ? 'badge-danger' : 'badge-success'}`}>
                        {u.disabled ? 'INACTIVO' : 'ACTIVO'}
                      </span>
                    </td>
                    <td>{formatDate(u.creationTime)}</td>
                    <td>{formatDate(u.lastSignInTime)}</td>
                    <td>
                      <div className="users-actions">
                        <button
                          className="btn-icon"
                          title={isAdmin ? 'Quitar admin' : 'Hacer admin'}
                          onClick={() => handleToggleAdmin(u)}
                          disabled={isSelf}
                        >
                          {isAdmin ? <ShieldCheck size={16} style={{ color: 'var(--accent)' }} /> : <Shield size={16} />}
                        </button>
                        <button
                          className="btn-icon"
                          title={u.disabled ? 'Habilitar' : 'Deshabilitar'}
                          onClick={() => handleToggleDisabled(u)}
                          disabled={isSelf}
                        >
                          {u.disabled
                            ? <ToggleLeft size={16} style={{ color: 'var(--danger)' }} />
                            : <ToggleRight size={16} style={{ color: 'var(--success)' }} />}
                        </button>
                        {confirmUid === u.uid ? (
                          <div className="users-confirm-delete">
                            <span style={{ fontSize: '0.6875rem', color: 'var(--danger)' }}>¿Seguro?</span>
                            <button className="btn btn-danger-sm" onClick={() => handleDelete(u.uid)} disabled={isSelf}>
                              Sí
                            </button>
                            <button className="btn" onClick={() => setConfirmUid(null)}>No</button>
                          </div>
                        ) : (
                          <button
                            className="btn-icon"
                            title="Eliminar usuario"
                            onClick={() => setConfirmUid(u.uid)}
                            disabled={isSelf}
                          >
                            <Trash2 size={16} style={{ color: isSelf ? 'var(--text-muted)' : 'var(--danger)' }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
