import { Users } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="glass-panel dashboard-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Users size={24} style={{ color: 'var(--primary)' }} />
        <h2 style={{ margin: 0 }}>Gestión de Usuarios</h2>
      </div>
      <p style={{ color: 'var(--text-muted)' }}>
        Administra los usuarios que tienen acceso al sistema de monitoreo de luminarias.
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
        Esta sección está en desarrollo. Pronto podrás agregar, editar y eliminar usuarios.
      </p>
    </div>
  );
}
