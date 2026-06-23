import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="glass-panel dashboard-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Settings size={24} style={{ color: 'var(--primary)' }} />
        <h2 style={{ margin: 0 }}>Configuración del Sistema</h2>
      </div>
      <p style={{ color: 'var(--text-muted)' }}>
        Configura los parámetros generales del sistema de monitoreo.
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
        Esta sección está en desarrollo.
      </p>
    </div>
  );
}
