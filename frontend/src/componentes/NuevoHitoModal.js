import { useState, useEffect, useCallback } from 'react';
import {
  apiListarTiposActividad,
  apiListarHitos,
  apiCrearHito,
  apiActualizarHito,
  apiEliminarHito,
} from '../services/api';

const INITIAL_FORM = {
  id_tipo_actividad: '',
  fecha_inicio: '',
  fecha_cierre: '',
  horas_dedicadas: '',
  nota: '',
};

/**
 * Modal para gestionar los hitos de una asignatura. Muestra la lista de hitos existentes
 * y un formulario para crear o editar uno. Valida tipo, fechas, horas y nota.
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Controla la visibilidad del modal
 * @param {function(): void} props.onClose - Callback para cerrar el modal
 * @param {{ id: number, nombre: string }} props.asignatura - Asignatura a la que pertenecen los hitos
 * @param {function(): void} props.onGuardar - Callback invocado tras crear, editar o eliminar un hito
 * @returns {JSX.Element | null}
 */
function NuevoHitoModal({ isOpen, onClose, asignatura, onGuardar }) {
  const [tipos, setTipos] = useState([]);
  const [hitos, setHitos] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editandoId, setEditandoId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /**
   * Carga la lista de hitos de la asignatura desde la API y actualiza el estado.
   * Memorizado con useCallback para usarse como dependencia estable en useEffect.
   * @returns {Promise<void>}
   */
  const cargarHitos = useCallback(async () => {
    if (!asignatura) return;
    try {
      const data = await apiListarHitos(asignatura.id);
      setHitos(data);
    } catch {
      // ignore
    }
  }, [asignatura]);

  useEffect(() => {
    if (!isOpen) return;
    apiListarTiposActividad()
      .then(setTipos)
      .catch(() => {});
    cargarHitos();
    setForm(INITIAL_FORM);
    setEditandoId(null);
    setErrors({});
  }, [isOpen, cargarHitos]);

  if (!isOpen) return null;

  /**
   * Valida todos los campos del formulario de hito: tipo, fechas, horas y nota (0-5).
   * @returns {boolean} true si el formulario es valido
   */
  const validate = () => {
    const newErrors = {};
    if (!form.id_tipo_actividad)
      newErrors.id_tipo_actividad = 'Selecciona un tipo de actividad.';
    if (!form.fecha_inicio)
      newErrors.fecha_inicio = 'La fecha de inicio es obligatoria.';
    if (!form.fecha_cierre)
      newErrors.fecha_cierre = 'La fecha de cierre es obligatoria.';
    if (!form.horas_dedicadas || Number(form.horas_dedicadas) <= 0) {
      newErrors.horas_dedicadas = 'Las horas deben ser mayores a 0.';
    }
    if (
      form.fecha_inicio &&
      form.fecha_cierre &&
      form.fecha_cierre < form.fecha_inicio
    ) {
      newErrors.fecha_cierre =
        'La fecha de cierre debe ser posterior o igual a la de inicio.';
    }
    if (form.nota !== '' && (Number(form.nota) < 0 || Number(form.nota) > 5)) {
      newErrors.nota = 'La nota debe estar entre 0.00 y 5.00.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Actualiza el campo del formulario y limpia su error si lo tenia.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  /**
   * Crea o actualiza un hito segun si hay un ID en edicion. Recarga la lista al completar.
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const datos = {
        id_tipo_actividad: Number(form.id_tipo_actividad),
        fecha_inicio: form.fecha_inicio,
        fecha_cierre: form.fecha_cierre,
        horas_dedicadas: form.horas_dedicadas,
        nota: form.nota === '' ? null : form.nota,
      };

      if (editandoId) {
        await apiActualizarHito(editandoId, datos);
      } else {
        await apiCrearHito(asignatura.id, datos);
      }

      await cargarHitos();
      setForm(INITIAL_FORM);
      setEditandoId(null);
      setErrors({});
      if (onGuardar) onGuardar();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga los datos de un hito existente en el formulario para editarlo.
   * @param {Object} hito - Hito a editar
   */
  const handleEditar = (hito) => {
    setEditandoId(hito.id_hito);
    setForm({
      id_tipo_actividad: String(hito.id_tipo_actividad),
      fecha_inicio: hito.fecha_inicio ? hito.fecha_inicio.slice(0, 10) : '',
      fecha_cierre: hito.fecha_cierre ? hito.fecha_cierre.slice(0, 10) : '',
      horas_dedicadas: String(hito.horas_dedicadas),
      nota: hito.nota !== null ? String(hito.nota) : '',
    });
    setErrors({});
  };

  /**
   * Pide confirmacion y elimina un hito, recargando la lista y notificando al padre.
   * @param {number} idHito
   * @returns {Promise<void>}
   */
  const handleEliminar = async (idHito) => {
    if (!window.confirm('¿Seguro que deseas eliminar este hito?')) return;
    try {
      await apiEliminarHito(idHito);
      await cargarHitos();
      if (onGuardar) onGuardar();
    } catch (err) {
      alert(err.message);
    }
  };

  /** Resetea el formulario, limpia el modo edicion y cierra el modal. */
  const handleCancel = () => {
    setForm(INITIAL_FORM);
    setEditandoId(null);
    setErrors({});
    onClose();
  };

  /**
   * Formatea una fecha en formato legible para el locale colombiano (dd/mm/aaaa).
   * @param {string | Date} d - Fecha a formatear
   * @returns {string} Fecha formateada, o cadena vacia si no se proporciona valor
   */
  const formatDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && handleCancel()}
    >
      <div className="modal-container" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h2 className="modal-title">Hitos — {asignatura.nombre}</h2>
          <button className="modal-close-btn" onClick={handleCancel}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {hitos.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <table className="tabla" style={{ fontSize: 13 }}>
                <thead>
                  <tr>
                    <th>TIPO</th>
                    <th>INICIO</th>
                    <th>CIERRE</th>
                    <th>HORAS</th>
                    <th>NOTA</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {hitos.map((h) => (
                    <tr key={h.id_hito}>
                      <td>{h.tipo_nombre}</td>
                      <td>{formatDate(h.fecha_inicio)}</td>
                      <td>{formatDate(h.fecha_cierre)}</td>
                      <td>{h.horas_dedicadas}h</td>
                      <td>{h.nota !== null ? h.nota : '—'}</td>
                      <td>
                        <div className="acciones-grupo">
                          <button
                            className="btn-tabla"
                            title="Editar"
                            onClick={() => handleEditar(h)}
                            style={{ fontSize: 12 }}
                          >
                            ✎
                          </button>
                          <button
                            className="btn-tabla eliminar"
                            title="Eliminar"
                            onClick={() => handleEliminar(h.id_hito)}
                            style={{ fontSize: 12 }}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p
            style={{
              color: '#94a3b8',
              fontSize: 13,
              fontWeight: 600,
              margin: '0 0 12px 0',
            }}
          >
            {editandoId ? 'Editar hito' : 'Nuevo hito'}
          </p>

          <div className="form-group">
            <label className="form-label">TIPO DE ACTIVIDAD *</label>
            <select
              name="id_tipo_actividad"
              className={
                errors.id_tipo_actividad
                  ? 'form-input input-error'
                  : 'form-select'
              }
              value={form.id_tipo_actividad}
              onChange={handleChange}
            >
              <option value="">Seleccionar...</option>
              {tipos.map((t) => (
                <option key={t.id_tipo} value={t.id_tipo}>
                  {t.nombre}
                </option>
              ))}
            </select>
            {errors.id_tipo_actividad && (
              <span className="error-message">{errors.id_tipo_actividad}</span>
            )}
          </div>

          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            <div className="form-group">
              <label className="form-label">FECHA INICIO *</label>
              <input
                name="fecha_inicio"
                type="date"
                className={
                  errors.fecha_inicio ? 'form-input input-error' : 'form-input'
                }
                value={form.fecha_inicio}
                onChange={handleChange}
              />
              {errors.fecha_inicio && (
                <span className="error-message">{errors.fecha_inicio}</span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">FECHA CIERRE *</label>
              <input
                name="fecha_cierre"
                type="date"
                className={
                  errors.fecha_cierre ? 'form-input input-error' : 'form-input'
                }
                value={form.fecha_cierre}
                onChange={handleChange}
              />
              {errors.fecha_cierre && (
                <span className="error-message">{errors.fecha_cierre}</span>
              )}
            </div>
          </div>

          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            <div className="form-group">
              <label className="form-label">HORAS DEDICADAS *</label>
              <input
                name="horas_dedicadas"
                type="number"
                step="0.5"
                min="0.5"
                className={
                  errors.horas_dedicadas
                    ? 'form-input input-error'
                    : 'form-input'
                }
                placeholder="Ej. 4"
                value={form.horas_dedicadas}
                onChange={handleChange}
              />
              {errors.horas_dedicadas && (
                <span className="error-message">{errors.horas_dedicadas}</span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">NOTA (0.00 – 5.00)</label>
              <input
                name="nota"
                type="number"
                step="0.1"
                min="0"
                max="5"
                className={
                  errors.nota ? 'form-input input-error' : 'form-input'
                }
                placeholder="Ej. 4.5"
                value={form.nota}
                onChange={handleChange}
              />
              {errors.nota && (
                <span className="error-message">{errors.nota}</span>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-cancelar"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="btn-guardar"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? 'Guardando...'
              : editandoId
                ? 'Actualizar hito'
                : 'Agregar hito'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NuevoHitoModal;
