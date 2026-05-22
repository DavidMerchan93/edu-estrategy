import {
  listarTiposActividad,
  listarHitosPorAsignatura,
  crearHitoDB,
  actualizarHitoDB,
  eliminarHitoDB,
} from '../consultas/hitoConsultas.js';

/**
 * @openapi
 * /api/hitos/tipos:
 *   get:
 *     tags:
 *       - Hitos
 *     summary: Obtiene los tipos de actividad disponibles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de actividad
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TipoActividad'
 */
export const getTiposActividad = async (req, res) => {
  try {
    const tipos = await listarTiposActividad();
    res.json(tipos);
  } catch (error) {
    console.error('[getTiposActividad]', error);
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * @openapi
 * /api/hitos/{idAsignatura}:
 *   get:
 *     tags:
 *       - Hitos
 *     summary: Obtiene los hitos de una asignatura
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAsignatura
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignatura
 *     responses:
 *       200:
 *         description: Lista de hitos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hito'
 *       401:
 *         description: Token requerido o inválido
 */
export const listarHitos = async (req, res) => {
  try {
    const { id_estudiante } = req.usuario;
    const { idAsignatura } = req.params;

    const hitos = await listarHitosPorAsignatura(idAsignatura, id_estudiante);
    res.json(hitos);
  } catch (error) {
    console.error('[listarHitos]', error);
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * @openapi
 * /api/hitos/{idAsignatura}:
 *   post:
 *     tags:
 *       - Hitos
 *     summary: Crea un nuevo hito en una asignatura
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idAsignatura
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignatura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearHitoRequest'
 *     responses:
 *       201:
 *         description: Hito creado correctamente
 *       400:
 *         description: Validación de campos fallida
 *       401:
 *         description: Token requerido o inválido
 *       404:
 *         description: Asignatura no encontrada
 */
export const crearHito = async (req, res) => {
  try {
    const { id_estudiante } = req.usuario;
    const { idAsignatura } = req.params;
    const { id_tipo_actividad, fecha_inicio, fecha_cierre, horas_dedicadas, nota } = req.body;

    if (!id_tipo_actividad || !fecha_inicio || !fecha_cierre || !horas_dedicadas) {
      return res.status(400).json({
        mensaje: 'Tipo de actividad, fecha de inicio, fecha de cierre y horas dedicadas son obligatorios',
      });
    }

    if (Number(horas_dedicadas) <= 0) {
      return res.status(400).json({ mensaje: 'Las horas dedicadas deben ser mayores a 0' });
    }

    if (new Date(fecha_cierre) < new Date(fecha_inicio)) {
      return res.status(400).json({ mensaje: 'La fecha de cierre debe ser posterior o igual a la de inicio' });
    }

    const notaValor = nota !== undefined && nota !== null && nota !== '' ? parseFloat(nota) : null;
    if (notaValor !== null && (notaValor < 0 || notaValor > 5)) {
      return res.status(400).json({ mensaje: 'La nota debe estar entre 0.00 y 5.00' });
    }

    const hito = await crearHitoDB(
      idAsignatura,
      id_estudiante,
      id_tipo_actividad,
      fecha_inicio,
      fecha_cierre,
      horas_dedicadas,
      notaValor
    );

    if (!hito) {
      return res.status(404).json({ mensaje: 'Asignatura no encontrada' });
    }

    res.status(201).json({
      mensaje: 'Hito creado correctamente',
      hito,
    });
  } catch (error) {
    console.error('[crearHito]', error);
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * @openapi
 * /api/hitos/{idHito}:
 *   put:
 *     tags:
 *       - Hitos
 *     summary: Actualiza un hito existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idHito
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearHitoRequest'
 *     responses:
 *       200:
 *         description: Hito actualizado correctamente
 *       400:
 *         description: Validación de campos fallida
 *       401:
 *         description: Token requerido o inválido
 *       404:
 *         description: Hito no encontrado
 */
export const actualizarHito = async (req, res) => {
  try {
    const { id_estudiante } = req.usuario;
    const { idHito } = req.params;
    const { id_tipo_actividad, fecha_inicio, fecha_cierre, horas_dedicadas, nota } = req.body;

    if (!id_tipo_actividad || !fecha_inicio || !fecha_cierre || !horas_dedicadas) {
      return res.status(400).json({
        mensaje: 'Tipo de actividad, fecha de inicio, fecha de cierre y horas dedicadas son obligatorios',
      });
    }

    if (Number(horas_dedicadas) <= 0) {
      return res.status(400).json({ mensaje: 'Las horas dedicadas deben ser mayores a 0' });
    }

    if (new Date(fecha_cierre) < new Date(fecha_inicio)) {
      return res.status(400).json({ mensaje: 'La fecha de cierre debe ser posterior o igual a la de inicio' });
    }

    const notaValor = nota !== undefined && nota !== null && nota !== '' ? parseFloat(nota) : null;
    if (notaValor !== null && (notaValor < 0 || notaValor > 5)) {
      return res.status(400).json({ mensaje: 'La nota debe estar entre 0.00 y 5.00' });
    }

    const hito = await actualizarHitoDB(
      idHito,
      id_estudiante,
      id_tipo_actividad,
      fecha_inicio,
      fecha_cierre,
      horas_dedicadas,
      notaValor
    );

    if (!hito) {
      return res.status(404).json({ mensaje: 'Hito no encontrado' });
    }

    res.json({
      mensaje: 'Hito actualizado correctamente',
      hito,
    });
  } catch (error) {
    console.error('[actualizarHito]', error);
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * @openapi
 * /api/hitos/{idHito}:
 *   delete:
 *     tags:
 *       - Hitos
 *     summary: Elimina un hito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idHito
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hito
 *     responses:
 *       200:
 *         description: Hito eliminado correctamente
 *       401:
 *         description: Token requerido o inválido
 *       404:
 *         description: Hito no encontrado
 */
export const eliminarHito = async (req, res) => {
  try {
    const { id_estudiante } = req.usuario;
    const { idHito } = req.params;

    const hito = await eliminarHitoDB(idHito, id_estudiante);

    if (!hito) {
      return res.status(404).json({ mensaje: 'Hito no encontrado' });
    }

    res.json({ mensaje: 'Hito eliminado correctamente' });
  } catch (error) {
    console.error('[eliminarHito]', error);
    res.status(500).json({ mensaje: error.message });
  }
};
