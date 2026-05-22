import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import NuevaAsignaturaModal from './NuevaAsignaturaModal';
import { apiFetchDashboard } from '../services/api';

function Dashboard({ setPantalla, usuario }) {
  const [busqueda, setBusqueda] = useState('');
  const [asignaturas, setAsignaturas] = useState([]);
  const [semestre, setSemestre] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [asignaturaEditando, setAsignaturaEditando] = useState(null);
  const [cargando, setCargando] = useState(true);

  /* App.css pone body en display:flex para centrar las tarjetas de Login/Registro.
     El Dashboard es full-page y no debe heredar ese centrado. */
  useEffect(() => {
    document.body.style.display = 'block';
    document.body.style.alignItems = 'unset';
    document.body.style.justifyContent = 'unset';

    return () => {
      document.body.style.display = 'flex';
      document.body.style.alignItems = 'center';
      document.body.style.justifyContent = 'center';
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('edu_token');
    if (!token) {
      setPantalla('login');
      return;
    }
    apiFetchDashboard(token)
      .then((data) => {
        setAsignaturas(data.asignaturas);
        setSemestre(data.semestreActivo);
      })
      .catch(() => setPantalla('login'))
      .finally(() => setCargando(false));
  }, [setPantalla]);

  const totalAsignaturas = asignaturas.length;

  const promedioGeneral =
    asignaturas.length > 0
      ? (
          asignaturas.reduce((acumulado, a) => acumulado + a.nota, 0) /
          asignaturas.length
        ).toFixed(1)
      : '0.0';

  const tiempoTotal = asignaturas.reduce(
    (acumulado, a) => acumulado + a.tiempo,
    0
  );

  const asignaturasFiltradas = asignaturas.filter(
    (a) =>
      a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const maxTiempo =
    asignaturas.length > 0 ? Math.max(...asignaturas.map((a) => a.tiempo)) : 1;
  const alturaTiempo = (tiempo) => Math.round((tiempo / maxTiempo) * 140);
  const alturaNota = (nota) => Math.round((nota / 5.0) * 140);

  const claseNota = (nota) => {
    if (nota >= 4.0) return 'nota-verde';
    if (nota >= 3.0) return 'nota-amarillo';
    return 'nota-rojo';
  };

  const nombreUsuario = usuario?.nombre_completo ?? 'Estudiante';
  const inicialesUsuario = usuario?.nombre_completo
    ? usuario.nombre_completo
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';
  const semestreActivo = semestre || '2026-1';

  const handleAbrirCrear = () => {
    setAsignaturaEditando(null);
    setModalAbierto(true);
  };

  const handleAbrirEditar = (asignatura) => {
    setAsignaturaEditando(asignatura);
    setModalAbierto(true);
  };

  const handleGuardar = (datos) => {
    if (asignaturaEditando) {
      // EDITAR
      setAsignaturas((prev) =>
        prev.map((a) =>
          a.id === asignaturaEditando.id ? { ...a, ...datos } : a
        )
      );
      alert('¡Asignatura actualizada correctamente ✍️!');
    } else {
      // CREAR
      const nueva = {
        id: Date.now(),
        codigo: datos.nombre.slice(0, 3).toUpperCase(),
        hitos: 0,
        nota: 0,
        tiempo: 0,
        ...datos,
      };
      alert('¡Asignatura guardada correctamente ✅!');
      setAsignaturas((prev) => [...prev, nueva]);
    }
    setModalAbierto(false);
  };

  const handleEliminar = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta asignatura 🗑️?')) {
      setAsignaturas((prev) => prev.filter((a) => a.id !== id));
    }
  };
  return (
    <div className="dashboard-pagina">
      {/* ---- BARRA DE NAVEGACIÓN SUPERIOR ---- */}
      <nav className="dashboard-nav">
        <span className="nav-logo">EDU·STRATEGY</span>

        <span className="nav-badge-semestre">
          Semestre {semestreActivo} · Activo
        </span>

        <div className="nav-usuario">
          <div className="avatar">{inicialesUsuario}</div>
          <span className="nombre-usuario">{nombreUsuario}</span>
          <button
            className="btn-cerrar-sesion"
            onClick={() => {
              localStorage.removeItem('edu_token');
              setPantalla('login');
            }}
            title="Cerrar sesión"
          >
            Salir
          </button>
        </div>
      </nav>

      {/* ---- CONTENIDO PRINCIPAL ---- */}
      <main className="dashboard-contenido">
        {/* ==== TARJETAS DE ESTADÍSTICAS ==== */}
        <div className="fila-estadisticas">
          <div className="tarjeta-stat">
            <div className="stat-etiqueta">ASIGNATURAS</div>
            <div className="stat-valor">{totalAsignaturas}</div>
            <div className="stat-subtitulo">Semestre {semestreActivo}</div>
          </div>

          <div className="tarjeta-stat">
            <div className="stat-etiqueta">PROMEDIO GENERAL</div>
            <div className="stat-valor verde">{promedioGeneral}</div>
            <div className="stat-subtitulo">Sobre 5.0</div>
          </div>

          <div className="tarjeta-stat">
            <div className="stat-etiqueta">TIEMPO TOTAL</div>
            <div className="stat-valor azul">{tiempoTotal}h</div>
            <div className="stat-subtitulo">Horas acumuladas</div>
          </div>
        </div>

        {/* ==== SECCIÓN: GRÁFICA DE BARRAS ==== */}
        <div className="tarjeta-seccion">
          <div className="seccion-header">
            <h2 className="seccion-titulo">Rendimiento por asignatura</h2>
            <button className="btn-accion">+ Semestre</button>
          </div>

          <div className="grafica-leyenda">
            <span className="leyenda-item">
              <span className="leyenda-punto azul"></span>
              Tiempo invertido (h)
            </span>
            <span className="leyenda-item">
              <span className="leyenda-punto amarillo"></span>
              Nota obtenida
            </span>
          </div>

          <div className="grafica-barras">
            {asignaturas.map((asignatura) => (
              <div key={asignatura.id} className="grafica-grupo">
                <div className="grafica-grupo-barras">
                  <div
                    className="barra azul"
                    style={{ height: `${alturaTiempo(asignatura.tiempo)}px` }}
                    title={`Tiempo: ${asignatura.tiempo}h`}
                  ></div>
                  <div
                    className="barra amarillo"
                    style={{ height: `${alturaNota(asignatura.nota)}px` }}
                    title={`Nota: ${asignatura.nota}`}
                  ></div>
                </div>
                <span className="grafica-etiqueta">{asignatura.codigo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ==== SECCIÓN: TABLA DE ASIGNATURAS ==== */}
        <div className="tarjeta-seccion">
          <div className="seccion-header">
            <h2 className="seccion-titulo">Asignaturas</h2>
          </div>

          <div className="tabla-header">
            <input
              className="buscador-input"
              type="text"
              placeholder="🔍︎ Buscar asignatura "
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button className="btn-accion" onClick={handleAbrirCrear}>
              + Crear asignatura
            </button>
          </div>

          <table className="tabla">
            <thead>
              <tr>
                <th>ASIGNATURA</th>
                <th>DOCENTE</th>
                <th>HITOS</th>
                <th>NOTA</th>
                <th>TIEMPO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {asignaturasFiltradas.map((asignatura) => (
                <tr key={asignatura.id}>
                  <td>
                    {asignatura.nombre}
                    <span className="badge-semestre">
                      {asignatura.semestre}
                    </span>
                  </td>
                  <td>{asignatura.docente}</td>
                  <td>
                    <span className="badge-hitos">
                      {asignatura.hitos} hitos
                    </span>
                  </td>
                  <td>
                    <span className={claseNota(asignatura.nota)}>
                      {asignatura.nota.toFixed(1)}
                    </span>
                  </td>
                  <td>{asignatura.tiempo}h</td>
                  <td>
                    <div className="acciones-grupo">
                      <button
                        className="btn-tabla"
                        title="Editar asignatura"
                        onClick={() => handleAbrirEditar(asignatura)}
                      >
                        🖊️
                      </button>
                      <button
                        className="btn-tabla eliminar"
                        title="Eliminar asignatura"
                        onClick={() => handleEliminar(asignatura.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {asignaturasFiltradas.length === 0 && (
            <p
              style={{
                textAlign: 'center',
                color: '#64748b',
                padding: '24px 0',
              }}
            >
              No se encontraron asignaturas que coincidan con "{busqueda}"
            </p>
          )}
          <NuevaAsignaturaModal
            isOpen={modalAbierto}
            onClose={() => setModalAbierto(false)}
            onGuardar={handleGuardar}
            asignaturaEditando={asignaturaEditando}
            loading={false}
          />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
