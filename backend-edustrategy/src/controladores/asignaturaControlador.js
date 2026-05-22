import {
  getSemestreActivoPorEstudiante,
  crearAsignaturaDB,
  actualizarAsignaturaDB,
  eliminarAsignaturaDB,
} from '../consultas/asignaturaConsultas.js';

/**
 * @openapi
 * /api/asignaturas:
 *   post:
 *     tags:
 *       - Asignaturas
 *     summary: Crea una nueva asignatura en el semestre activo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearAsignaturaRequest'
 *     responses:
 *       201:
 *         description: Asignatura creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Asignatura creada correctamente
 *                 asignatura:
 *                   $ref: '#/components/schemas/Asignatura'
 *       400:
 *         description: Nombre y docente son obligatorios
 *       401:
 *         description: Token requerido o inválido
 *       404:
 *         description: No tienes un semestre activo
 */
export const crearAsignatura = async (req, res) => {
  try {
    const { id_estudiante } = req.usuario;
    const { nombre, docente } = req.body;

    if (!nombre || !docente) {
      return res
        .status(400)
        .json({ mensaje: 'Nombre y docente son obligatorios' });
    }

    const semestre = await getSemestreActivoPorEstudiante(id_estudiante);
    if (!semestre) {
      return res.status(404).json({ mensaje: 'No tienes un semestre activo' });
    }

    const asignatura = await crearAsignaturaDB(
      semestre.id_semestre,
      nombre.trim(),
      docente.trim()
    );

    res.status(201).json({
      mensaje: 'Asignatura creada correctamente',
      asignatura,
    });
  } catch (error) {
    console.error('[crearAsignatura]', error);
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * @openapi
 * /api/asignaturas/{id}:
 *   put:
 *     tags:
 *       - Asignaturas
 *     summary: Actualiza una asignatura existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignatura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearAsignaturaRequest'
 *     responses:
 *       200:
 *         description: Asignatura actualizada correctamente
 *       400:
 *         description: Nombre y docente son obligatorios
 *       401:
 *         description: Token requerido o inválido
 *       404:
 *         description: Asignatura no encontrada
 */
export const actualizarAsignatura = async (req, res) => {
  try {
    const { id_estudiante } = req.usuario;
    const { id } = req.params;
    const { nombre, docente } = req.body;

    if (!nombre || !docente) {
      return res
        .status(400)
        .json({ mensaje: 'Nombre y docente son obligatorios' });
    }

    const asignatura = await actualizarAsignaturaDB(
      id,
      id_estudiante,
      nombre.trim(),
      docente.trim()
    );

    if (!asignatura) {
      return res.status(404).json({ mensaje: 'Asignatura no encontrada' });
    }

    res.status(200).json({
      mensaje: 'Asignatura actualizada correctamente',
      asignatura,
    });
  } catch (error) {
    console.error('[actualizarAsignatura]', error);
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * @openapi
 * /api/asignaturas/{id}:
 *   delete:
 *     tags:
 *       - Asignaturas
 *     summary: Elimina una asignatura
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignatura
 *     responses:
 *       200:
 *         description: Asignatura eliminada correctamente
 *       401:
 *         description: Token requerido o inválido
 *       404:
 *         description: Asignatura no encontrada
 */
export const eliminarAsignatura = async (req, res) => {
  try {
    const { id_estudiante } = req.usuario;
    const { id } = req.params;

    const asignatura = await eliminarAsignaturaDB(id, id_estudiante);

    if (!asignatura) {
      return res.status(404).json({ mensaje: 'Asignatura no encontrada' });
    }

    res.status(200).json({ mensaje: 'Asignatura eliminada correctamente' });
  } catch (error) {
    console.error('[eliminarAsignatura]', error);
    res.status(500).json({ mensaje: error.message });
  }
};
