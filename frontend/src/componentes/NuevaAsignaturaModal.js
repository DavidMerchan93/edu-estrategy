import { useState, useEffect } from 'react';

const SEMESTRES = ['2025-1', '2025-2', '2026-1', '2026-2', '2027-1', '2027-2'];

const INITIAL_FORM = {
  nombre: '',
  docente: '',
  semestre: '2026-1',
};

/**
 * Modal para crear o editar una asignatura. Si recibe `asignaturaEditando`,
 * precarga el formulario con los datos existentes; de lo contrario opera en modo creacion.
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Controla la visibilidad del modal
 * @param {function(): void} props.onClose - Callback para cerrar el modal
 * @param {function(Object): void} props.onGuardar - Callback con los datos validados del formulario
 * @param {boolean} props.loading - Muestra estado de carga en el boton de guardar
 * @param {Object | null} props.asignaturaEditando - Asignatura a editar, o null para crear una nueva
 * @returns {JSX.Element | null}
 */
function NuevaAsignaturaModal({
  isOpen,
  onClose,
  onGuardar,
  loading,
  asignaturaEditando,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  useEffect(() => {
    if (asignaturaEditando) {
      setForm({
        nombre: asignaturaEditando.nombre,
        docente: asignaturaEditando.docente,
        semestre: asignaturaEditando.semestre,
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [asignaturaEditando, isOpen]);

  const [errors, setErrors] = useState({ nombre: '', docente: '' });

  if (!isOpen) return null;

  /**
   * Valida que nombre y docente no esten vacios. Actualiza el estado de errores.
   * @returns {boolean} true si el formulario es valido
   */
  const validate = () => {
    const newErrors = { nombre: '', docente: '' };
    let valid = true;

    if (!form.nombre.trim()) {
      newErrors.nombre = 'El nombre de la asignatura es obligatorio.';
      valid = false;
    }
    if (!form.docente.trim()) {
      newErrors.docente = 'El nombre del docente es obligatorio.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  /**
   * Actualiza el campo del formulario y limpia su error si lo tenia.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /** Valida el formulario y, si es correcto, llama a `onGuardar` con los datos. */
  const handleGuardar = () => {
    if (!validate()) return;
    onGuardar({
      nombre: form.nombre.trim(),
      docente: form.docente.trim(),
      semestre: form.semestre,
    });
    setForm(INITIAL_FORM);
    setErrors({ nombre: '', docente: '' });
  };

  /** Resetea el formulario y cierra el modal via `onClose`. */
  const handleCancel = () => {
    setForm(INITIAL_FORM);
    setErrors({ nombre: '', docente: '' });
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && handleCancel()}
    >
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">
            {asignaturaEditando ? 'Editar asignatura' : 'Nueva asignatura'}
          </h2>
          <button className="modal-close-btn" onClick={handleCancel}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">NOMBRE DE LA ASIGNATURA *</label>
            <input
              name="nombre"
              type="text"
              className={
                errors.nombre ? 'form-input input-error' : 'form-input'
              }
              placeholder="Ej. Cálculo Diferencial"
              value={form.nombre}
              onChange={handleChange}
              maxLength={100}
            />
            {errors.nombre && (
              <span className="error-message">{errors.nombre}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">NOMBRE DEL DOCENTE *</label>
            <input
              name="docente"
              type="text"
              className={
                errors.docente ? 'form-input input-error' : 'form-input'
              }
              placeholder="Ej. Prof. García"
              value={form.docente}
              onChange={handleChange}
              maxLength={80}
            />
            {errors.docente && (
              <span className="error-message">{errors.docente}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">SEMESTRE</label>
            <select
              name="semestre"
              className="form-select"
              value={form.semestre}
              onChange={handleChange}
            >
              {SEMESTRES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
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
            {loading ? 'Guardando...' : 'Guardar asignatura'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NuevaAsignaturaModal;
