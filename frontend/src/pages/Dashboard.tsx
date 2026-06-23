import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, Users, Settings, LogOut, Lightbulb, Zap, Activity, Thermometer, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { luminariasService } from '../services/luminarias.service';
import type { LuminariaStats, Luminaria } from '../types/luminaria';
import MapView from './MapView';
import UsersPage from './UsersPage';
import SettingsPage from './SettingsPage';

function DashboardHome() {
  const [stats, setStats] = useState<LuminariaStats | null>(null);
  const [recentIssues, setRecentIssues] = useState<Luminaria[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    luminariasService.getStats().then(setStats).catch((e) => setError(e.message));
    luminariasService.getAll()
      .then(data => {
        const damaged = data.filter(l => l.estado?.toLowerCase() !== 'enciende');
        setRecentIssues(damaged.slice(0, 8));
      })
      .catch(() => {});
  }, []);

  if (error) {
    return (
      <div className="panel" style={{ padding: '1.5rem', color: 'var(--danger)' }}>
        Error al cargar estadísticas: {error}
      </div>
    );
  }

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <Lightbulb size={14} />
            Total Luminarias
          </div>
          <div className="stat-card-value">{stats?.total ?? '...'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <Zap size={14} />
            Funcionan
          </div>
          <div className="stat-card-value success">{stats?.porEstado?.enciende ?? '...'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <Activity size={14} />
            Dañadas
          </div>
          <div className="stat-card-value warning">{stats?.porEstado?.['dañado/parpadea'] ?? '...'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <Thermometer size={14} />
            Luxes Promedio
          </div>
          <div className="stat-card-value accent">{stats?.luxesPromedio ? `${Math.round(stats.luxesPromedio)} lx` : '...'}</div>
        </div>
      </div>

      <div className="home-grid">
        <div className="home-section full">
          <div className="home-section-title">
            <Activity size={14} /> Luminarias con Incidencias
          </div>
          {recentIssues.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '0.5rem 0' }}>
              Sin incidencias registradas.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sector</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Luxes</th>
                </tr>
              </thead>
              <tbody>
                {recentIssues.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{l.id}</td>
                    <td>{l.facultad}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{l.tipo?.toUpperCase()}</td>
                    <td>
                      <span className={`badge ${l.estado?.toLowerCase() === 'no enciende' ? 'badge-danger' : l.estado?.toLowerCase() === 'dañado/parpadea' ? 'badge-warning' : 'badge-success'}`}>
                        {l.estado}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{l.luxes ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isMapRoute = location.pathname === '/dashboard/mapa';
  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const pageTitle = isMapRoute ? 'Análisis Geográfico' : location.pathname === '/dashboard/users' ? 'Usuarios' : location.pathname === '/dashboard/settings' ? 'Configuración' : 'Panel de Control';

  return (
    <div className={`dashboard-layout ${isMapRoute ? 'map-layout' : ''}`}>
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${isMapRoute ? 'map-mode' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">Luminarias</div>
          <button className="btn-icon sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}>
            <Menu size={18} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
            <LayoutDashboard size={18} />
            <span>Inicio</span>
          </Link>
          <Link to="/dashboard/mapa" className={`nav-link ${isActive('/dashboard/mapa')}`}>
            <Map size={18} />
            <span>Mapa</span>
          </Link>
          <Link to="/dashboard/users" className={`nav-link ${isActive('/dashboard/users')}`}>
            <Users size={18} />
            <span>Usuarios</span>
          </Link>
          <Link to="/dashboard/settings" className={`nav-link ${isActive('/dashboard/settings')}`}>
            <Settings size={18} />
            <span>Configuración</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-link" style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: 'inherit', fontFamily: 'inherit' }}>
            <LogOut size={18} />
            <span>Salir</span>
          </button>
        </div>
      </aside>
      <main className={`main-content ${isMapRoute ? 'map-fullscreen' : ''}`}>
        {!isMapRoute && (
          <header className="topbar">
            <div className="topbar-left">
              <div className="page-title">{pageTitle}</div>
            </div>
            <div className="topbar-right">
              <div className="user-profile">
                <div className="user-avatar">A</div>
                <span>Admin</span>
              </div>
            </div>
          </header>
        )}
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/mapa" element={<MapView />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
