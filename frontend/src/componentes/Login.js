import React, { useState } from 'react';

function Login({ setPantalla }) {
  // guardar los datos diligenciados y recordar por el programa. para que el programa los recuerde
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Gestión del envío del formulario
  const handleLogin = async (e) => {
    e.preventDefault(); // Payload para evitar que recargue y borre datos.
    const loginPayload = { email, password }; // encapsular datos para el envio al bakend

    /* // CONEXIÓN CON EL BACKEND "PENDIENTE"
    try {
      const response = await fetch('URLSUPABASE', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload)
      });
      const data = await response.json();
    } catch (error) {
      alert("Error al conectar con el servidor");
    }
    */

    // Navegar al dashboard una vez el login sea exitoso
    setPantalla('dashboard');
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
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group full-width">
          <label>CONTRASEÑA</label>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
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
    </div>
  );
}

export default Login;
