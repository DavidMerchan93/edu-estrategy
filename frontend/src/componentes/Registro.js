import React, { useState } from 'react';

/**
 * Pantalla de registro de nuevo estudiante. La integracion con el backend
 * esta pendiente de implementacion (handleSubmit actualmente no realiza peticion HTTP).
 * @component
 * @param {Object} props
 * @param {function(string): void} props.setPantalla - Cambia la pantalla activa de la app
 * @returns {JSX.Element}
 */
function Registro({ setPantalla }) {
  // guardar los datos del registro para que el programa los recuerde
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

  /**
   * Actualiza el campo correspondiente en formData cuando el usuario escribe en un input.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Maneja el envio del formulario de registro. La conexion con el backend esta pendiente.
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Payload para evitar que recargue y borre datos.

    /* // CONEXIÓN CON EL BACKEND "PENDIENTE"
    try {
      const response = await fetch('URL SUPABASE', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) alert("Registro exitoso");
    } catch (error) {
      alert("Error al registrarse");
    }
    */
  };

  return (
    <div className="card">
      <div className="nav-interna"></div>

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
