import React, { useState } from 'react';
import { usuariosFake } from '../data/mockData';

function Login({ setPantalla, setUsuario }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const encontrado = usuariosFake.find(
      (u) => u.correo === email && u.password === password
    );
    if (encontrado) {
      setUsuario(encontrado);
      setPantalla('dashboard');
    } else {
      setError('Correo o contraseña incorrectos.');
    }
  };

  const autocompletar = () => {
    setEmail('estudiante@edu.com');
    setPassword('123456');
    setError('');
  };

  return (
    <div className="card">
      <div className="nav-interna">
        <button className="btn-nav active">Iniciar Sesión</button>
        <button className="btn-nav" onClick={() => setPantalla('registro')}>
          Registrarse
        </button>
      </div>

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
        <button type="submit" className="btn-submit">
          Acceder
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
          <span>estudiante@edu.com</span> / <span>123456</span>
        </p>
        <p className="demo-dato">
          <span>maria@edu.com</span> / <span>123456</span>
        </p>
        <button className="demo-btn" type="button" onClick={autocompletar}>
          Autocompletar primera cuenta
        </button>
      </div>
    </div>
  );
}

export default Login;
