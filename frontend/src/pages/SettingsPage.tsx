import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Settings size={20} style={{ color: 'var(--accent)' }} />
        <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Configuración del Sistema</h2>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Configura los parámetros generales del sistema de monitoreo.
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '1rem' }}>
        Esta sección está en desarrollo.
      </p>
    </div>
  );
}
