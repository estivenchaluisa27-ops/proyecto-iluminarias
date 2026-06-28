import { useState, useEffect } from 'react';
import { Settings, Monitor, Bell, Database, MapPin, Save, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AppSettings {
  mapCenter: string;
  mapZoom: string;
  heatmapRadius: string;
  heatmapBlur: string;
  heatmapMaxZoom: string;
  notificationsEnabled: boolean;
  refreshInterval: string;
}

const DEFAULTS: AppSettings = {
  mapCenter: '-2.1510,-79.9645',
  mapZoom: '16',
  heatmapRadius: '25',
  heatmapBlur: '15',
  heatmapMaxZoom: '17',
  notificationsEnabled: false,
  refreshInterval: '30',
};

const STORAGE_KEY = 'iluminarias_settings';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* ignored */ }
  return { ...DEFAULTS };
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof AppSettings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings({ ...DEFAULTS });
    saveSettings({ ...DEFAULTS });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  useEffect(() => {
    const onStorage = () => setSettings(loadSettings());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="settings-header-left">
          <Settings size={20} style={{ color: 'var(--accent)' }} />
          <div>
            <h2 className="settings-title">Configuración del Sistema</h2>
            <p className="settings-subtitle">Ajusta los parámetros de visualización y comportamiento</p>
          </div>
        </div>
        <div className="settings-header-actions">
          <button className="btn" onClick={handleReset}>Restaurar valores</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={14} />
            {saved ? 'Guardado ✓' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="settings-grid">
        <section className="panel settings-section">
          <div className="settings-section-header">
            <MapPin size={16} />
            <h3>Mapa</h3>
          </div>
          <div className="settings-fields">
            <div className="form-group">
              <label className="form-label">Centro del mapa (lat, lng)</label>
              <input
                type="text"
                className="form-input"
                value={settings.mapCenter}
                onChange={(e) => handleChange('mapCenter', e.target.value)}
                placeholder="-2.1510,-79.9645"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Zoom inicial</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="20"
                value={settings.mapZoom}
                onChange={(e) => handleChange('mapZoom', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Radio del heatmap</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="100"
                value={settings.heatmapRadius}
                onChange={(e) => handleChange('heatmapRadius', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Desenfoque del heatmap</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="50"
                value={settings.heatmapBlur}
                onChange={(e) => handleChange('heatmapBlur', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Zoom máximo del heatmap</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="20"
                value={settings.heatmapMaxZoom}
                onChange={(e) => handleChange('heatmapMaxZoom', e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="panel settings-section">
          <div className="settings-section-header">
            <Monitor size={16} />
            <h3>Pantalla</h3>
          </div>
          <div className="settings-fields">
            <div className="form-group">
              <label className="form-label">Intervalo de actualización de datos (seg)</label>
              <input
                type="number"
                className="form-input"
                min="5"
                max="300"
                value={settings.refreshInterval}
                onChange={(e) => handleChange('refreshInterval', e.target.value)}
              />
            </div>
          </div>

          <hr className="section-divider" />

          <div className="settings-section-header">
            <Bell size={16} />
            <h3>Notificaciones</h3>
          </div>
          <div className="settings-fields">
            <label className="settings-toggle-row">
              <span className="settings-toggle-label">Notificaciones del sistema</span>
              <button
                type="button"
                className={`settings-toggle ${settings.notificationsEnabled ? 'active' : ''}`}
                onClick={() => handleChange('notificationsEnabled', !settings.notificationsEnabled)}
              >
                <span className="settings-toggle-knob" />
              </button>
            </label>
          </div>
        </section>

        <section className="panel settings-section settings-section-info">
          <div className="settings-section-header">
            <Database size={16} />
            <h3>Información del Sistema</h3>
          </div>
          <div className="settings-info-grid">
            <div className="settings-info-item">
              <span className="settings-info-label">Versión</span>
              <span className="settings-info-value">1.0.0</span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Usuario actual</span>
              <span className="settings-info-value">{user?.email ?? '—'}</span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Stack</span>
              <span className="settings-info-value">React 19 + Firebase</span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Base de datos</span>
              <span className="settings-info-value">Firestore + JSON</span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Categoría</span>
              <span className="settings-info-value">Monitoreo de Luminarias</span>
            </div>
          </div>
          <div className="settings-tip">
            <Info size={14} />
            <span>Los cambios de mapa y pantalla se aplican al recargar la página.</span>
          </div>
        </section>
      </div>
    </div>
  );
}
