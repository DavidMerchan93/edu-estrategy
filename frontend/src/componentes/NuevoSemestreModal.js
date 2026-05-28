import { useState, useEffect } from 'react';

const INITIAL_FORM = {
  nombre: '',
  fecha_inicio: '',
  fecha_fin: '',
  activo: true,
};

/**
 * Modal para crear un nuevo semestre academico. Incluye validacion de fechas
 * (fecha_fin debe ser posterior a fecha_inicio) y opcion de activarlo inmediatamente.
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Controla la visibilidad del modal
 * @param {function(): void} props.onClose - Callback para cerrar el modal
 * @param {function(Object): void} props.onGuardar - Callback con los datos validados
 * @param {boolean} props.loading - Muestra estado de carga en el boton de guardar
 * @returns {JSX.Element | null}
 */
function NuevoSemestreModal({ isOpen, onClose, onGuardar, loading }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_FORM);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /**
   * Valida nombre, fechas y que fecha_fin sea posterior a fecha_inicio.
   * @returns {boolean} true si el formulario es valido
   */
  const validate = () => {
    const newErrors = {};
    if (!form.nombre.trim()) {
      newErrors.nombre = 'El nombre del semestre es obligatorio.';
    }
    if (!form.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es obligatoria.';
    }
    if (!form.fecha_fin) {
      newErrors.fecha_fin = 'La fecha de fin es obligatoria.';
    }
    if (
      form.fecha_inicio &&
      form.fecha_fin &&
      form.fecha_fin <= form.fecha_inicio
    ) {
      newErrors.fecha_fin =
        'La fecha de fin debe ser posterior a la de inicio.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Actualiza el campo del formulario. Soporta inputs tipo text, date y checkbox.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /** Valida el formulario y, si es correcto, llama a `onGuardar` con los datos. */
  const handleGuardar = () => {
    if (!validate()) return;
    onGuardar({
      nombre: form.nombre.trim(),
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin,
      activo: form.activo,
    });
  };

  /** Resetea el formulario y cierra el modal via `onClose`. */
  const handleCancel = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && handleCancel()}
    >
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Nuevo semestre</h2>
          <button className="modal-close-btn" onClick={handleCancel}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">NOMBRE DEL SEMESTRE *</label>
            <input
              name="nombre"
              type="text"
              className={
                errors.nombre ? 'form-input input-error' : 'form-input'
              }
              placeholder="Ej. 2026-2"
              value={form.nombre}
              onChange={handleChange}
              maxLength={30}
            />
            {errors.nombre && (
              <span className="error-message">{errors.nombre}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">FECHA DE INICIO *</label>
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
            <label className="form-label">FECHA DE FIN *</label>
            <input
              name="fecha_fin"
              type="date"
              className={
                errors.fecha_fin ? 'form-input input-error' : 'form-input'
              }
              value={form.fecha_fin}
              onChange={handleChange}
            />
            {errors.fecha_fin && (
              <span className="error-message">{errors.fecha_fin}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <input
                name="activo"
                type="checkbox"
                checked={form.activo}
                onChange={handleChange}
                style={{ marginRight: 8 }}
              />
              Activar este semestre
            </label>
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
            onClick={handleGuardar}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar semestre'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NuevoSemestreModal;
