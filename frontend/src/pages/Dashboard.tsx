import { useEffect, useState, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, Users, Settings, LogOut, Lightbulb, Zap, Activity, Thermometer, Menu, LightbulbOff, Filter, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { luminariasService } from '../services/luminarias.service';
import type { LuminariaStats, Luminaria } from '../types/luminaria';
import { FACULTADES } from '../types/luminaria';
import MapView from './MapView';
import UsersPage from './UsersPage';
import SettingsPage from './SettingsPage';

function DashboardHome() {
  const [stats, setStats] = useState<LuminariaStats | null>(null);
  const [recentIssues, setRecentIssues] = useState<Luminaria[]>([]);
  const [error, setError] = useState('');
  const [homeFacultad, setHomeFacultad] = useState(FACULTADES[0]);

  useEffect(() => {
    luminariasService.getStats().then(setStats).catch((e) => setError(e.message));
    luminariasService.getAll()
      .then(data => {
        const damaged = data.filter(l => l.estado?.toLowerCase() !== 'enciende');
        setRecentIssues(damaged.slice(0, 8));
      })
      .catch(() => {});
  }, []);

  const homeFilteredIssues = homeFacultad === FACULTADES[0]
    ? recentIssues
    : recentIssues.filter((l) => l.facultad?.trim() === homeFacultad);

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
            <LightbulbOff size={14} />
            No funcionan
          </div>
          <div className="stat-card-value warning">
            {stats ? ((stats.porEstado?.['no enciende'] ?? 0) + (stats.porEstado?.['dañado/parpadea'] ?? 0) + (stats.porEstado?.['desconocido'] ?? 0)) : '...'}
          </div>
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
          <div className="incidencias-filter">
            <Filter size={12} />
            <select
              className="incidencias-filter-select"
              value={homeFacultad}
              onChange={(e) => setHomeFacultad(e.target.value)}
            >
              {FACULTADES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <span className="incidencias-count">{homeFilteredIssues.length} resultados</span>
          </div>
          {homeFilteredIssues.length === 0 ? (
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
                {homeFilteredIssues.map(l => (
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const isMapRoute = location.pathname === '/dashboard/mapa';
  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const pageTitle = isMapRoute ? 'Análisis Geográfico' : location.pathname === '/dashboard/users' ? 'Usuarios' : location.pathname === '/dashboard/settings' ? 'Configuración' : 'Panel de Control';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div className={`dashboard-layout ${isMapRoute ? 'map-layout' : ''}`}>
      {!isMapRoute && (
        <header className="topbar">
          <div className="topbar-left">
            <div className="nav-menu-wrapper" ref={menuRef}>
              <button className="btn-icon nav-menu-trigger" onClick={() => setMenuOpen(!menuOpen)} title="Menú de navegación">
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              {menuOpen && (
                <nav className="nav-dropdown">
                  <Link to="/dashboard" className={`nav-dropdown-item ${isActive('/dashboard')}`} onClick={() => setMenuOpen(false)}>
                    <LayoutDashboard size={16} />
                    <span>Inicio</span>
                  </Link>
                  <Link to="/dashboard/mapa" className={`nav-dropdown-item ${isActive('/dashboard/mapa')}`} onClick={() => setMenuOpen(false)}>
                    <Map size={16} />
                    <span>Mapa</span>
                  </Link>
                  <Link to="/dashboard/users" className={`nav-dropdown-item ${isActive('/dashboard/users')}`} onClick={() => setMenuOpen(false)}>
                    <Users size={16} />
                    <span>Usuarios</span>
                  </Link>
                  <Link to="/dashboard/settings" className={`nav-dropdown-item ${isActive('/dashboard/settings')}`} onClick={() => setMenuOpen(false)}>
                    <Settings size={16} />
                    <span>Configuración</span>
                  </Link>
                  <div className="nav-dropdown-divider" />
                  <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Salir</span>
                  </button>
                </nav>
              )}
            </div>
            <div className="page-title">{pageTitle}</div>
          </div>
          <div className="topbar-right">
            <div className="user-profile">
              <div className="user-avatar">{(user?.email?.[0] ?? 'A').toUpperCase()}</div>
              <span>{user?.email ?? 'Admin'}</span>
            </div>
          </div>
        </header>
      )}

      {isMapRoute && (
        <div className="nav-menu-wrapper nav-menu-map" ref={menuRef}>
          <button className="btn-icon nav-menu-trigger" onClick={() => setMenuOpen(!menuOpen)} title="Menú de navegación">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          {menuOpen && (
            <nav className="nav-dropdown">
              <Link to="/dashboard" className={`nav-dropdown-item ${isActive('/dashboard')}`} onClick={() => setMenuOpen(false)}>
                <LayoutDashboard size={16} />
                <span>Inicio</span>
              </Link>
              <Link to="/dashboard/mapa" className={`nav-dropdown-item ${isActive('/dashboard/mapa')}`} onClick={() => setMenuOpen(false)}>
                <Map size={16} />
                <span>Mapa</span>
              </Link>
              <Link to="/dashboard/users" className={`nav-dropdown-item ${isActive('/dashboard/users')}`} onClick={() => setMenuOpen(false)}>
                <Users size={16} />
                <span>Usuarios</span>
              </Link>
              <Link to="/dashboard/settings" className={`nav-dropdown-item ${isActive('/dashboard/settings')}`} onClick={() => setMenuOpen(false)}>
                <Settings size={16} />
                <span>Configuración</span>
              </Link>
              <div className="nav-dropdown-divider" />
              <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Salir</span>
              </button>
            </nav>
          )}
        </div>
      )}

      <main className={`main-content ${isMapRoute ? 'map-fullscreen' : ''}`}>
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
