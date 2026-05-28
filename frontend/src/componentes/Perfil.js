import React, { useState, useRef, useEffect } from 'react';
import {
  apiActualizarPerfil,
  apiSubirFoto,
  apiEliminarCuenta,
  apiObtenerHistorialSemestres,
} from '../services/api';
import './Perfil.css';

const API_BASE = (
  process.env.REACT_APP_API_URL || 'http://localhost:5000'
).replace('/api', '');

function Perfil({ usuario, onVolver, onUsuarioActualizado }) {
  const [form, setForm] = useState({
    nombre_completo: usuario?.nombre_completo || '',
    carrera: usuario?.carrera || '',
    semestre_actual: usuario?.semestre_actual || 1,
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoArchivo, setFotoArchivo] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [semestres, setSemestres] = useState([]);
  const [cargandoSemestres, setCargandoSemestres] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    apiObtenerHistorialSemestres()
      .then(setSemestres)
      .catch(() => {})
      .finally(() => setCargandoSemestres(false));
  }, []);

  const fotoActual = usuario?.foto_url
    ? `${API_BASE}${usuario.foto_url}`
    : null;

  const iniciales = usuario?.nombre_completo
    ? usuario.nombre_completo
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMensaje(null);
  };

  const handleFotoSeleccionada = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoArchivo(file);
    const reader = new FileReader();
    reader.onload = (ev) => setFotoPreview(ev.target.result);
    reader.readAsDataURL(file);
    setMensaje(null);
  };

  const handleSubirFoto = async () => {
    if (!fotoArchivo) return;
    setSubiendoFoto(true);
    setMensaje(null);
    try {
      const data = await apiSubirFoto(fotoArchivo);
      setFotoPreview(null);
      setFotoArchivo(null);
      setMensaje({ tipo: 'exito', texto: 'Foto actualizada correctamente.' });
      if (onUsuarioActualizado) {
        onUsuarioActualizado({ foto_url: data.foto_url });
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setSubiendoFoto(false);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);
    try {
      const actualizado = await apiActualizarPerfil({
        nombre_completo: form.nombre_completo.trim(),
        carrera: form.carrera.trim(),
        semestre_actual: Number(form.semestre_actual),
      });
      setMensaje({ tipo: 'exito', texto: 'Perfil actualizado correctamente.' });
      if (onUsuarioActualizado) onUsuarioActualizado(actualizado);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarCuenta = async () => {
    setEliminando(true);
    try {
      await apiEliminarCuenta();
      localStorage.removeItem('edu_token');
      window.location.reload();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
      setEliminando(false);
      setConfirmarEliminar(false);
    }
  };

  return (
    <div className="perfil-pagina">
      <div className="perfil-contenido">
        <div className="perfil-tarjeta">
          <div className="perfil-header">
            <div
              className="perfil-avatar-wrapper"
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              {fotoPreview || fotoActual ? (
                <img
                  src={fotoPreview || fotoActual}
                  alt="Avatar"
                  className="perfil-avatar-img"
                />
              ) : (
                <div className="perfil-avatar">{iniciales}</div>
              )}
              <div className="perfil-avatar-overlay">
                <span>📷</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFotoSeleccionada}
              style={{ display: 'none' }}
            />
            <h1 className="perfil-titulo">Mi Perfil</h1>
            <p className="perfil-subtitulo">
              {usuario?.carrera || ''} {'·'} Semestre{' '}
              {usuario?.semestre_actual || 1}
            </p>
          </div>

          {fotoArchivo && (
            <div className="perfil-foto-accion">
              <span className="perfil-foto-nombre">{fotoArchivo.name}</span>
              <button
                className="btn-perfil-guardar btn-perfil-guardar-sm"
                onClick={handleSubirFoto}
                disabled={subiendoFoto}
              >
                {subiendoFoto ? 'Subiendo...' : 'Guardar foto'}
              </button>
            </div>
          )}

          <div className="perfil-estado">
            <div className="perfil-estado-item">
              <span className="perfil-estado-indicador" />
              <span>Activo</span>
            </div>
            <div className="perfil-estado-item">
              <span>📚</span>
              <span>Estudiando</span>
            </div>
            <div className="perfil-estado-item">
              <span className="perfil-estado-label">Fecha de ingreso:</span>
              <span>
                {usuario?.fecha_ingreso
                  ? new Date(usuario.fecha_ingreso).toLocaleDateString(
                      'es-ES',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )
                  : '—'}
              </span>
            </div>
          </div>

          <form className="perfil-cuerpo" onSubmit={handleGuardar}>
            <div className="perfil-grid">
              <div className="perfil-campo">
                <label>Nombre completo</label>
                <input
                  className="perfil-input"
                  name="nombre_completo"
                  type="text"
                  value={form.nombre_completo}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>

              <div className="perfil-campo">
                <label>Carrera</label>
                <input
                  className="perfil-input"
                  name="carrera"
                  type="text"
                  value={form.carrera}
                  onChange={handleChange}
                  placeholder="Tu carrera"
                  required
                />
              </div>

              <div className="perfil-campo">
                <label>Correo electrónico</label>
                <div className="perfil-campo-email">
                  <input
                    className="perfil-input"
                    type="email"
                    value={usuario?.email || ''}
                    disabled
                  />
                  <span
                    className={`perfil-badge-verif ${usuario?.verificado ? 'verificado' : 'no-verificado'}`}
                  >
                    {usuario?.verificado ? 'Verificado' : 'No verificado'}
                  </span>
                </div>
              </div>

              <div className="perfil-campo">
                <label>Semestre actual</label>
                <input
                  className="perfil-input"
                  name="semestre_actual"
                  type="number"
                  min={1}
                  max={15}
                  value={form.semestre_actual}
                  onChange={handleChange}
                  required
                />
              </div>

              {mensaje && (
                <div
                  className="perfil-mensaje-full"
                  style={{ gridColumn: 'span 2' }}
                >
                  <div className={`perfil-mensaje ${mensaje.tipo}`}>
                    {mensaje.texto}
                  </div>
                </div>
              )}

              <div className="perfil-acciones">
                <button
                  type="button"
                  className="btn-perfil-volver"
                  onClick={onVolver}
                >
                  Volver al Dashboard
                </button>
                <button
                  type="submit"
                  className="btn-perfil-guardar"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </form>

          <div className="perfil-seccion">
            <h3 className="perfil-seccion-titulo">Historial de semestres</h3>
            {cargandoSemestres ? (
              <p className="perfil-seccion-vacio">Cargando...</p>
            ) : semestres.length === 0 ? (
              <p className="perfil-seccion-vacio">Sin semestres registrados.</p>
            ) : (
              <div className="perfil-tabla-semestres">
                {semestres.map((s) => (
                  <div key={s.id_semestre} className="perfil-fila-semestre">
                    <div className="perfil-fila-info">
                      <span className="perfil-fila-nombre">
                        {s.nombre}
                        {s.activo && (
                          <span className="perfil-fila-activo">Activo</span>
                        )}
                      </span>
                      <span className="perfil-fila-detalle">
                        {s.total_asignaturas} asig. · {s.tiempo_total}h
                      </span>
                    </div>
                    <span
                      className={`perfil-fila-nota ${
                        Number(s.promedio) >= 4.0
                          ? 'nota-verde'
                          : Number(s.promedio) >= 3.0
                            ? 'nota-amarillo'
                            : 'nota-rojo'
                      }`}
                    >
                      {Number(s.promedio).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="perfil-peligro">
            <h3 className="perfil-peligro-titulo">Zona de peligro</h3>
            {!confirmarEliminar ? (
              <button
                className="btn-perfil-eliminar"
                onClick={() => setConfirmarEliminar(true)}
              >
                Eliminar mi cuenta
              </button>
            ) : (
              <div className="perfil-confirmar-eliminar">
                <p className="perfil-confirmar-texto">
                  ¿Estás seguro? Esta acción eliminará todos tus datos
                  (asignaturas, semestres, hitos) y no se puede deshacer.
                </p>
                <div className="perfil-confirmar-acciones">
                  <button
                    className="btn-perfil-cancelar-eliminar"
                    onClick={() => setConfirmarEliminar(false)}
                    disabled={eliminando}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn-perfil-eliminar-confirmar"
                    onClick={handleEliminarCuenta}
                    disabled={eliminando}
                  >
                    {eliminando ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Perfil;
