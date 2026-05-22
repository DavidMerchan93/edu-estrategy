import React, { useState } from 'react';
import { apiLogin } from '../services/api';

function Login({ setPantalla, setUsuario }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token, usuario } = await apiLogin(email, password);
      localStorage.setItem('edu_token', token);
      setUsuario(usuario);
      setPantalla('dashboard');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const autocompletar = () => {
    setEmail('david@correo.edu.co');
    setPassword('Admin2026');
    setError('');
  };

  return (
    <div className="login-container">
      <div className="card">
        <div className="nav-interna"></div>

        <h2 className="titulo-logo">ESTRATEGIA EDUCATIVA</h2>
        <p className="subtitulo">Gestión de Rendimiento Académico</p>

        <form className="formulario-grid" onSubmit={handleLogin}>
          <div className="input-group full-width">
            <label>CORREO INSTITUCIONAL</label>
            <input
              type="email"
              placeholder="usuario@correo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              required
            />
          </div>
          <div className="input-group full-width">
            <label>CONTRASEÑA</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              required
            />
          </div>
          {error && <p className="error-mensaje">{error}</p>}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Verificando...' : 'Acceder'}
          </button>
        </form>

        <div className="footer-links">
          <span className="enlace" onClick={() => setPantalla('registro')}>
            ¿No tienes cuenta? Regístrate
          </span>
          <span className="enlace">¿Olvidó su contraseña?</span>
        </div>

        <div className="demo-caja">
          <p className="demo-titulo">Credenciales de prueba</p>
          <p className="demo-dato">
            <span>david@correo.edu.co</span> / <span>Admin2026</span>
          </p>
          <p className="demo-dato">
            <span>tatiana@correo.edu.co</span> / <span>Admin2026</span>
          </p>
          <button className="demo-btn" type="button" onClick={autocompletar}>
            Autocompletar primera cuenta
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
