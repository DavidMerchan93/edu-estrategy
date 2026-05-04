import { useState } from 'react';
import NuevaAsignaturaModal from './NuevaAsignaturaModal';

function Dashboard({ setPantalla }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGuardar = (datos) => {
    setLoading(true);
    setTimeout(() => {
      setAsignaturas((prev) => [...prev, { ...datos, id: Date.now() }]);
      setLoading(false);
      setModalOpen(false);
    }, 600);
  };

  return (
    <div className="dashboard-wrapper">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">EDU·STRATEGY</div>
        <nav className="sidebar-nav">
          <div className="nav-item active">
            <span className="nav-icon">⊞</span> Dashboard
          </div>
          <div className="nav-item">
            <span className="nav-icon">⚙</span> Ajustes
          </div>
        </nav>
      </aside>

      {/* Main */}
      <div className="dashboard-main">

        {/* Topbar */}
        <header className="topbar">
          <div className="semestre-badge">Semestre 2026-1 · Activo</div>
          <div className="user-info">
            <div className="avatar">AP</div>
            <span>Nombre Estudiante</span>
          </div>
        </header>

        {/* Contenido */}
        <main className="dashboard-content">
          {asignaturas.length === 0 ? (

            /* Empty state */
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h2 className="empty-title">Sin asignaturas registradas</h2>
              <p className="empty-desc">
                Agrega tu primera asignatura para comenzar a realizar seguimiento de tu rendimiento académico.
              </p>
              <button className="btn-crear" onClick={() => setModalOpen(true)}>
                + Crear primera asignatura
              </button>
            </div>

          ) : (

            /* Tabla con asignaturas */
            <div className="tabla-wrapper">
              <div className="tabla-header">
                <h2>Asignaturas</h2>
                <button className="btn-crear" onClick={() => setModalOpen(true)}>
                  + Crear asignatura
                </button>
              </div>
              <table className="tabla">
                <thead>
                  <tr>
                    <th>ASIGNATURA</th>
                    <th>DOCENTE</th>
                    <th>SEMESTRE</th>
                  </tr>
                </thead>
                <tbody>
                  {asignaturas.map((a) => (
                    <tr key={a.id}>
                      <td>{a.nombre}</td>
                      <td>{a.docente}</td>
                      <td>{a.semestre}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          )}
        </main>
      </div>

      {/* Modal */}
      <NuevaAsignaturaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onGuardar={handleGuardar}
        loading={loading}
      />

    </div>
  );
}

export default Dashboard;