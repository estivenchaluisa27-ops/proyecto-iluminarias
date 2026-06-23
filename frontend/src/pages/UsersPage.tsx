import { Users } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Users size={20} style={{ color: 'var(--accent)' }} />
        <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Gestión de Usuarios</h2>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Administra los usuarios que tienen acceso al sistema de monitoreo de luminarias.
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '1rem' }}>
        Esta sección está en desarrollo. Pronto podrás agregar, editar y eliminar usuarios.
      </p>
    </div>
  );
}
