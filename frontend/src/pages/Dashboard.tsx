import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';

const DashboardHome = () => (
  <div className="glass-panel dashboard-card">
    <h2>Bienvenido al Dashboard</h2>
    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
      Selecciona una opción del menú lateral.
    </p>
  </div>
);

const Dashboard = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-title">Luminarias</div>
        <nav>
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
            <LayoutDashboard size={20} /> Inicio
          </Link>
          <Link to="/dashboard/users" className={`nav-link ${isActive('/dashboard/users')}`}>
            <Users size={20} /> Usuarios
          </Link>
          <Link to="/dashboard/settings" className={`nav-link ${isActive('/dashboard/settings')}`}>
            <Settings size={20} /> Configuración
          </Link>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <Link to="/login" className="nav-link" style={{ color: '#ef4444' }}>
            <LogOut size={20} /> Salir
          </Link>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 35, height: 35, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              A
            </div>
            <span>Admin User</span>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/users" element={<div className="glass-panel dashboard-card">Gestión de Usuarios</div>} />
          <Route path="/settings" element={<div className="glass-panel dashboard-card">Configuración del Sistema</div>} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
