import React, { useState } from 'react';

const obtenerIniciales = (nombre) => {
  const partes = nombre.trim().split(' ').filter(Boolean);
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return partes[0].slice(0, 2).toUpperCase();
};

function Registro({ setPantalla, setUsuario }) {
  const [formData, setFormData] = useState({
    identificacion: '',
    nombre: '',
    correo: '',
    carrera: '',
    semestre: '',
    fechaIngreso: '',
    password: '',
    confirmar: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const nuevoUsuario = {
      id: Date.now(),
      identificacion: formData.identificacion,
      nombre: formData.nombre,
      iniciales: obtenerIniciales(formData.nombre),
      correo: formData.correo,
      password: formData.password,
      carrera: formData.carrera,
      semestre: parseInt(formData.semestre, 10),
      fechaIngreso: formData.fechaIngreso,
      semestreActivo: '2026-1',
    };

    /* // CONEXIÓN CON EL BACKEND "PENDIENTE"
    try {
      const response = await fetch('URL SUPABASE', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoUsuario)
      });
      if (response.ok) { ... }
    } catch (error) {
      alert("Error al registrarse");
    }
    */

    setUsuario(nuevoUsuario);
    setPantalla('dashboard');
  };

  return (
    <div className="card">
      <div className="nav-interna">
        <button className="btn-nav" onClick={() => setPantalla('login')}>
          Iniciar Sesión
        </button>
        <button className="btn-nav active">Registrarse</button>
      </div>

      <h2 className="titulo-logo">ESTRATEGIA EDUCATIVA</h2>
      <p className="subtitulo">Registro de Estudiante</p>

      <form className="formulario-grid" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>IDENTIFICACIÓN</label>
          <input
            name="identificacion"
            type="text"
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label>NOMBRE COMPLETO</label>
          <input name="nombre" type="text" onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>CORREO</label>
          <input name="correo" type="email" onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>CARRERA</label>
          <input name="carrera" type="text" onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>SEMESTRE</label>
          <input
            name="semestre"
            type="number"
            min="1"
            max="12"
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label>FECHA DE INGRESO</label>
          <input
            name="fechaIngreso"
            type="date"
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label>CONTRASEÑA</label>
          <input
            name="password"
            type="password"
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label>CONFIRMAR</label>
          <input
            name="confirmar"
            type="password"
            onChange={handleChange}
            required
          />
        </div>
        {error && <p className="error-mensaje">{error}</p>}
        <button type="submit" className="btn-submit">
          Finalizar Registro
        </button>
      </form>

      <div className="footer-links">
        <span className="enlace" onClick={() => setPantalla('login')}>
          ¿Ya tienes cuenta? Inicia sesión
        </span>
      </div>
    </div>
  );
}

export default Registro;
