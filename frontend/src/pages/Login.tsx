import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  // React state to handle sliding animation (toggles "slide-up" class)
  const [isSignUp, setIsSignUp] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Status states
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(email, password);
      // Firebase signs in automatically after registration
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="card-wrapper">
        <div className="form-structor">
          {/* SIGNUP SECTION */}
          <div className={`signup ${!isSignUp ? 'slide-up' : ''}`}>
            <h2 className="form-title" id="signup" onClick={() => setIsSignUp(true)}>
              <span>o</span>Crear cuenta
            </h2>
            <p className="form-subtitle">Reporta y consulta el estado de la iluminación</p>

            <form onSubmit={handleRegisterSubmit}>
              <div className="form-holder">
                <div className="input-container">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    className="input"
                    placeholder="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                  />
                </div>
                <div className="input-container">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    className="input"
                    placeholder="Correo Electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={isSignUp}
                  />
                </div>
                <div className="input-container">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type="password"
                    className="input"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={isSignUp}
                  />
                </div>
              </div>
              
              {isSignUp && error && <p className="error-msg">{error}</p>}
              
              <button type="submit" className="submit-btn" disabled={busy || !isSignUp}>
                {busy ? 'Creando...' : 'Crear cuenta'}
              </button>
            </form>
          </div>

          {/* LOGIN SECTION */}
          <div className={`login ${isSignUp ? 'slide-up' : ''}`}>
            <div className="center">
              <h2 className="form-title" id="login" onClick={() => setIsSignUp(false)}>
                <span>o</span>Iniciar sesión
              </h2>

              <form onSubmit={handleLoginSubmit}>
                <div className="form-holder">
                  <div className="input-container">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      type="email"
                      className="input"
                      placeholder="Correo Electrónico"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required={!isSignUp}
                    />
                  </div>
                  <div className="input-container">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type="password"
                      className="input"
                      placeholder="Contraseña"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required={!isSignUp}
                    />
                  </div>
                </div>

                {!isSignUp && error && <p className="error-msg">{error}</p>}

                <button type="submit" className="submit-btn" disabled={busy || isSignUp}>
                  {busy ? 'Ingresando...' : 'Iniciar sesión'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
