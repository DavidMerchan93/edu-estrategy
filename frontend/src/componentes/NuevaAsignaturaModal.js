import { useState } from 'react';


const SEMESTRES = ['2025-1', '2025-2', '2026-1', '2026-2', '2027-1', '2027-2'];

const INITIAL_FORM = {
  nombre: '',
  docente: '',
  semestre: '2026-1',
};

function NuevaAsignaturaModal({ isOpen, onClose, onGuardar, loading }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({ nombre: '', docente: '' });

  if (!isOpen) return null;

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

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

  const handleCancel = () => {
    setForm(INITIAL_FORM);
    setErrors({ nombre: '', docente: '' });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCancel()}>
      <div className="modal-container">

        <div className="modal-header">
          <h2 className="modal-title">Nueva asignatura</h2>
          <button className="modal-close-btn" onClick={handleCancel}>×</button>
        </div>

        <div className="modal-body">

          <div className="form-group">
            <label className="form-label">NOMBRE DE LA ASIGNATURA *</label>
            <input
              name="nombre"
              type="text"
              className={errors.nombre ? 'form-input input-error' : 'form-input'}
              placeholder="Ej. Cálculo Diferencial"
              value={form.nombre}
              onChange={handleChange}
              maxLength={100}
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">NOMBRE DEL DOCENTE *</label>
            <input
              name="docente"
              type="text"
              className={errors.docente ? 'form-input input-error' : 'form-input'}
              placeholder="Ej. Prof. García"
              value={form.docente}
              onChange={handleChange}
              maxLength={80}
            />
            {errors.docente && <span className="error-message">{errors.docente}</span>}
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
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={handleCancel} disabled={loading}>
            Cancelar
          </button>
          <button className="btn-guardar" onClick={handleGuardar} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar asignatura'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default NuevaAsignaturaModal;