import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import NuevaAsignaturaModal from './NuevaAsignaturaModal';
import NuevoSemestreModal from './NuevoSemestreModal';
import NuevoHitoModal from './NuevoHitoModal';
import {
  apiFetchDashboard,
  apiCrearAsignatura,
  apiActualizarAsignatura,
  apiEliminarAsignatura,
  apiCrearSemestre,
} from '../services/api';

/**
 * Tablero principal de la aplicacion. Muestra estadisticas del semestre activo,
 * grafica de barras por asignatura y tabla filtrable con operaciones CRUD sobre
 * asignaturas e hitos. Redirige al login si el token es invalido o ha expirado.
 * @component
 * @param {Object} props
 * @param {function(string): void} props.setPantalla - Cambia la pantalla activa de la app
 * @param {Object} props.usuario - Datos del usuario autenticado
 * @param {string} props.usuario.nombre_completo - Nombre completo del estudiante
 * @returns {JSX.Element}
 */
function Dashboard({ setPantalla, usuario }) {
  const [busqueda, setBusqueda] = useState('');
  const [asignaturas, setAsignaturas] = useState([]);
  const [semestre, setSemestre] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [semestreModalAbierto, setSemestreModalAbierto] = useState(false);
  const [hitoModalAbierto, setHitoModalAbierto] = useState(false);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState(null);
  const [asignaturaEditando, setAsignaturaEditando] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);

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
      .catch(() => setPantalla('login'));
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
  /**
   * Calcula la altura en pixeles de la barra de tiempo de una asignatura
   * relativa al maximo tiempo entre todas las asignaturas (escala a 140px).
   * @param {number} tiempo - Horas dedicadas a la asignatura
   * @returns {number} Altura en pixeles
   */
  const alturaTiempo = (tiempo) => Math.round((tiempo / maxTiempo) * 140);

  /**
   * Calcula la altura en pixeles de la barra de nota (escala sobre 5.0 → 140px).
   * @param {number} nota
   * @returns {number} Altura en pixeles
   */
  const alturaNota = (nota) => Math.round((nota / 5.0) * 140);

  /**
   * Devuelve la clase CSS de color segun el rango de la nota.
   * Verde >= 4.0, amarillo >= 3.0, rojo < 3.0.
   * @param {number} nota
   * @returns {'nota-verde' | 'nota-amarillo' | 'nota-rojo'}
   */
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

  /** Abre el modal de creacion de asignatura en modo "nueva". */
  const handleAbrirCrear = () => {
    setAsignaturaEditando(null);
    setModalAbierto(true);
  };

  /**
   * Abre el modal de asignatura en modo "edicion" con los datos de la asignatura seleccionada.
   * @param {Object} asignatura - Asignatura a editar
   */
  const handleAbrirEditar = (asignatura) => {
    setAsignaturaEditando(asignatura);
    setModalAbierto(true);
  };

  /**
   * Crea o actualiza una asignatura segun si hay una en modo edicion.
   * Actualiza el estado local sin recargar el dashboard completo.
   * @param {{ nombre: string, docente: string, semestre: string }} datos
   * @returns {Promise<void>}
   */
  const handleGuardar = async (datos) => {
    setLoadingModal(true);
    try {
      if (asignaturaEditando) {
        const actualizada = await apiActualizarAsignatura(
          asignaturaEditando.id,
          {
            nombre: datos.nombre,
            docente: datos.docente,
          }
        );
        setAsignaturas((prev) =>
          prev.map((a) =>
            a.id === asignaturaEditando.id
              ? {
                  ...a,
                  nombre: actualizada.nombre,
                  codigo: actualizada.nombre.slice(0, 3).toUpperCase(),
                  docente: actualizada.nombre_docente,
                }
              : a
          )
        );
      } else {
        const nueva = await apiCrearAsignatura({
          nombre: datos.nombre,
          docente: datos.docente,
        });
        setAsignaturas((prev) => [
          ...prev,
          {
            id: nueva.id_asignatura,
            nombre: nueva.nombre,
            codigo: nueva.nombre.slice(0, 3).toUpperCase(),
            docente: nueva.nombre_docente,
            semestre: semestreActivo,
            hitos: 0,
            nota: 0,
            tiempo: 0,
          },
        ]);
      }
      setModalAbierto(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingModal(false);
    }
  };

  /**
   * Pide confirmacion y elimina una asignatura, actualizando el estado local.
   * @param {number} id - ID de la asignatura
   * @returns {Promise<void>}
   */
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta asignatura?')) return;
    try {
      await apiEliminarAsignatura(id);
      setAsignaturas((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  /**
   * Recarga los datos del dashboard desde la API y actualiza el estado de asignaturas y semestre.
   * @returns {Promise<void>}
   */
  const refreshDashboard = async () => {
    const token = localStorage.getItem('edu_token');
    const data = await apiFetchDashboard(token);
    setAsignaturas(data.asignaturas);
    setSemestre(data.semestreActivo);
  };

  /**
   * Crea un nuevo semestre y refresca el dashboard al completar.
   * @param {{ nombre: string, fecha_inicio: string, fecha_fin: string, activo: boolean }} datos
   * @returns {Promise<void>}
   */
  const handleCrearSemestre = async (datos) => {
    setLoadingModal(true);
    try {
      await apiCrearSemestre(datos);
      setSemestreModalAbierto(false);
      await refreshDashboard();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingModal(false);
    }
  };

  /**
   * Abre el modal de hitos para la asignatura indicada.
   * @param {Object} asignatura - Asignatura seleccionada
   */
  const handleAbrirHitos = (asignatura) => {
    setAsignaturaSeleccionada(asignatura);
    setHitoModalAbierto(true);
  };

  /**
   * Callback invocado despues de guardar o eliminar un hito para sincronizar las estadisticas.
   * @returns {Promise<void>}
   */
  const handleHitoGuardado = async () => {
    await refreshDashboard();
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
            <button
              className="btn-accion"
              onClick={() => setSemestreModalAbierto(true)}
            >
              + Semestre
            </button>
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
                        className="btn-tabla"
                        title="Ver hitos"
                        onClick={() => handleAbrirHitos(asignatura)}
                        style={{ borderColor: '#334155', fontSize: 11 }}
                      >
                        H
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
            loading={loadingModal}
          />
          <NuevoSemestreModal
            isOpen={semestreModalAbierto}
            onClose={() => setSemestreModalAbierto(false)}
            onGuardar={handleCrearSemestre}
            loading={loadingModal}
          />
          <NuevoHitoModal
            isOpen={hitoModalAbierto}
            onClose={() => setHitoModalAbierto(false)}
            asignatura={asignaturaSeleccionada}
            onGuardar={handleHitoGuardado}
          />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
