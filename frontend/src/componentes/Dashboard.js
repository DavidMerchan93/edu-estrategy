import React, { useState, useEffect } from 'react';
import './Dashboard.css';

/* ============================================================
   DATOS DE PRUEBA
   ============================================================ */
const asignaturasMock = [
  {
    id: 1,
    nombre: 'Matemáticas',
    codigo: 'MAT',
    docente: 'Prof. García',
    hitos: 3,
    nota: 3.9,
    tiempo: 30,
    semestre: '2026-1',
  },
  {
    id: 2,
    nombre: 'Inglés',
    codigo: 'ING',
    docente: 'Prof. Williams',
    hitos: 5,
    nota: 4.5,
    tiempo: 120,
    semestre: '2026-1',
  },
  {
    id: 3,
    nombre: 'Español',
    codigo: 'ESP',
    docente: 'Prof. Torres',
    hitos: 2,
    nota: 4.6,
    tiempo: 23,
    semestre: '2026-1',
  },
  {
    id: 4,
    nombre: 'Física',
    codigo: 'FIS',
    docente: 'Prof. Ramírez',
    hitos: 4,
    nota: 3.2,
    tiempo: 28,
    semestre: '2026-1',
  },
  {
    id: 5,
    nombre: 'Cálculo',
    codigo: 'CAL',
    docente: 'Prof. Mora',
    hitos: 6,
    nota: 2.7,
    tiempo: 13,
    semestre: '2026-1',
  },
];

/* Datos del usuario de sesión activa (mock hasta integrar autenticación) */
const usuarioMock = {
  nombre: 'Alexander P.',
  iniciales: 'AP',
  semestre: '2026-1',
};

function Dashboard({ setPantalla }) {
  /* Texto escrito en el buscador de la tabla */
  const [busqueda, setBusqueda] = useState('');

  /* Lista de asignaturas del semestre actual */
  const [asignaturas] = useState(asignaturasMock);

  /* ---- CORRECCIÓN DEL LAYOUT ----
     App.css pone body en display:flex para centrar las tarjetas de Login/Registro.
     El Dashboard es full-page y no debe heredar ese centrado, por eso se neutraliza
     al montar el componente y se restaura cuando el usuario vuelva a otra pantalla. */
  useEffect(() => {
    document.body.style.display = 'block';
    document.body.style.alignItems = 'unset';
    document.body.style.justifyContent = 'unset';

    return () => {
      /* Restaurar estilos al desmontar el Dashboard */
      document.body.style.display = 'flex';
      document.body.style.alignItems = 'center';
      document.body.style.justifyContent = 'center';
    };
  }, []);

  /* ========================
     ESTADÍSTICAS CALCULADAS
     Se derivan de los datos para que se actualicen solos cuando llegue el backend
     ======================== */

  /* Número total de asignaturas en el semestre */
  const totalAsignaturas = asignaturas.length;

  /* Promedio de todas las notas, redondeado a un decimal */
  const promedioGeneral = (
    asignaturas.reduce((acumulado, a) => acumulado + a.nota, 0) /
    asignaturas.length
  ).toFixed(1);

  /* Suma de horas invertidas en todas las asignaturas */
  const tiempoTotal = asignaturas.reduce(
    (acumulado, a) => acumulado + a.tiempo,
    0
  );

  /* ========================
     LÓGICA DE BÚSQUEDA
     Filtra la tabla en tiempo real por nombre o código de asignatura
     ======================== */
  const asignaturasFiltradas = asignaturas.filter(
    (a) =>
      a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  /* ========================
     LÓGICA DE LA GRÁFICA DE BARRAS (CSS puro)
     Las alturas se calculan en píxeles relativas al máximo de cada escala
     ======================== */

  /* Valor máximo de tiempo para normalizar las barras azules */
  const maxTiempo = Math.max(...asignaturas.map((a) => a.tiempo));

  /* Altura en px de la barra azul (tiempo), máximo visual: 140px */
  const alturaTiempo = (tiempo) => Math.round((tiempo / maxTiempo) * 140);

  /* Altura en px de la barra amarilla (nota sobre escala de 5.0), máximo visual: 140px */
  const alturaNota = (nota) => Math.round((nota / 5.0) * 140);

  /* ========================
     LÓGICA DE COLOR DE NOTA
     Verde ≥ 4.0 | Amarillo 3.0–3.9 | Rojo < 3.0
     ======================== */
  const claseNota = (nota) => {
    if (nota >= 4.0) return 'nota-verde';
    if (nota >= 3.0) return 'nota-amarillo';
    return 'nota-rojo';
  };

  /* ========================
     RENDERIZADO
     ======================== */
  return (
    <div className="dashboard-pagina">
      {/* ---- BARRA DE NAVEGACIÓN SUPERIOR ---- */}
      <nav className="dashboard-nav">
        {/* Logo de la aplicación */}
        <span className="nav-logo">EDU·STRATEGY</span>

        {/* Badge que indica el semestre activo */}
        <span className="nav-badge-semestre">
          Semestre {usuarioMock.semestre} · Activo
        </span>

        {/* Avatar e información del usuario */}
        <div className="nav-usuario">
          <div className="avatar">{usuarioMock.iniciales}</div>
          <span className="nombre-usuario">{usuarioMock.nombre}</span>
        </div>
      </nav>

      {/* ---- CONTENIDO PRINCIPAL ---- */}
      <main className="dashboard-contenido">
        {/* ==== TARJETAS DE ESTADÍSTICAS ==== */}
        <div className="fila-estadisticas">
          {/* Tarjeta: total de asignaturas */}
          <div className="tarjeta-stat">
            <div className="stat-etiqueta">ASIGNATURAS</div>
            <div className="stat-valor">{totalAsignaturas}</div>
            <div className="stat-subtitulo">
              Semestre {usuarioMock.semestre}
            </div>
          </div>

          {/* Tarjeta: promedio general (verde) */}
          <div className="tarjeta-stat">
            <div className="stat-etiqueta">PROMEDIO GENERAL</div>
            <div className="stat-valor verde">{promedioGeneral}</div>
            <div className="stat-subtitulo">Sobre 5.0</div>
          </div>

          {/* Tarjeta: tiempo total acumulado (azul) */}
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

          {/* Leyenda de colores */}
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

          {/* Gráfica: un grupo de barras por asignatura */}
          <div className="grafica-barras">
            {asignaturas.map((asignatura) => (
              <div key={asignatura.id} className="grafica-grupo">
                {/* Par de barras: azul (tiempo) + amarilla (nota) */}
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
                {/* Código abreviado de la asignatura */}
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

          {/* Controles de la tabla: buscador y botón de creación */}
          <div className="tabla-header">
            <input
              className="buscador-input"
              type="text"
              placeholder="Buscar asignatura..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button className="btn-accion">+ Crear asignatura</button>
          </div>

          {/* Tabla de asignaturas filtradas */}
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
                  {/* Nombre + badge del semestre */}
                  <td>
                    {asignatura.nombre}
                    <span className="badge-semestre">
                      {asignatura.semestre}
                    </span>
                  </td>

                  {/* Nombre del docente */}
                  <td>{asignatura.docente}</td>

                  {/* Cantidad de hitos con badge */}
                  <td>
                    <span className="badge-hitos">
                      {asignatura.hitos} hitos
                    </span>
                  </td>

                  {/* Nota con color según rendimiento */}
                  <td>
                    <span className={claseNota(asignatura.nota)}>
                      {asignatura.nota.toFixed(1)}
                    </span>
                  </td>

                  {/* Tiempo invertido en horas */}
                  <td>{asignatura.tiempo}h</td>

                  {/* Botones de acción */}
                  <td>
                    <div className="acciones-grupo">
                      {/* Ver hitos de la asignatura */}
                      <button className="btn-tabla" title="Ver hitos">
                        ≡
                      </button>
                      {/* Editar asignatura */}
                      <button className="btn-tabla" title="Editar asignatura">
                        ⚙
                      </button>
                      {/* Eliminar asignatura */}
                      <button
                        className="btn-tabla eliminar"
                        title="Eliminar asignatura"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mensaje cuando el buscador no encuentra resultados */}
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
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
