import { useEffect, useState, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { luminariasService } from '../services/luminarias.service';
import type { LuminariaStats } from '../types/luminaria';
import MapView from './MapView';
import UsersPage from './UsersPage';
import SettingsPage from './SettingsPage';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';

function DashboardHome() {
  const [stats, setStats] = useState<LuminariaStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    luminariasService.getStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="panel" style={{ padding: '1.5rem', color: 'var(--danger)' }}>
        Error al cargar estadísticas: {error}
      </div>
    );
  }

  return <AnalyticsDashboard stats={stats} />;
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
