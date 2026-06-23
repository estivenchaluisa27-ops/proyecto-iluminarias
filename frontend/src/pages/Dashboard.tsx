import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, Users, Settings, LogOut, Lightbulb, Zap, Activity, Thermometer } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { luminariasService } from '../services/luminarias.service';
import type { LuminariaStats } from '../types/luminaria';
import MapView from './MapView';
import UsersPage from './UsersPage';
import SettingsPage from './SettingsPage';

function DashboardHome() {
  const [stats, setStats] = useState<LuminariaStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    luminariasService.getStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="glass-panel dashboard-card" style={{ color: '#ef4444' }}>
        Error al cargar estadísticas: {error}
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Lightbulb size={20} style={{ color: '#22c55e' }} />
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Luminarias</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats?.total ?? '...'}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Zap size={20} style={{ color: '#22c55e' }} />
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Funcionan</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#22c55e' }}>{stats?.porEstado?.enciende ?? '...'}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Activity size={20} style={{ color: '#f97316' }} />
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Dañadas</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f97316' }}>{stats?.porEstado?.['dañado/parpadea'] ?? '...'}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Thermometer size={20} style={{ color: '#3b82f6' }} />
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Luxes Promedio</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>{stats?.luxesPromedio ? `${stats.luxesPromedio} lx` : '...'}</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Map size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ margin: 0 }}>Mapa de Luminarias</h3>
        </div>
        <MapView />
      </div>
    </>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-title">Luminarias</div>
        <nav>
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
            <LayoutDashboard size={20} /> Inicio
          </Link>
          <Link to="/dashboard/mapa" className={`nav-link ${isActive('/dashboard/mapa')}`}>
            <Map size={20} /> Mapa
          </Link>
          <Link to="/dashboard/users" className={`nav-link ${isActive('/dashboard/users')}`}>
            <Users size={20} /> Usuarios
          </Link>
          <Link to="/dashboard/settings" className={`nav-link ${isActive('/dashboard/settings')}`}>
            <Settings size={20} /> Configuración
          </Link>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <button onClick={handleLogout} className="nav-link" style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: 'inherit', fontFamily: 'inherit' }}>
            <LogOut size={20} /> Salir
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 35, height: 35, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              A
            </div>
            <span>Admin</span>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/mapa" element={
            <div className="glass-panel dashboard-card">
              <h3 style={{ marginBottom: '1rem' }}>Mapa de Luminarias</h3>
              <MapView />
            </div>
          } />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
