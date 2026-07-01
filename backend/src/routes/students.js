const express = require("express");
const pool = require("../config/db");

const router = express.Router();

function serializeStudent(a, pagos) {
  return {
    id: a.id,
    nombre: a.nombre,
    no_control: a.no_control,
    grupo: a.grupo,
    nivel: a.nivel,
    telefono: a.telefono,
    correo: a.correo,
    estado: a.estado,
    fecha_inscripcion: a.fecha_inscripcion ? a.fecha_inscripcion.toISOString().slice(0, 10) : null,
    modalidad_pago: a.modalidad_pago,
    avance: a.avance || {},
    pagos: pagos.map(p => ({
      id: p.id,
      fecha: p.fecha.toISOString().slice(0, 10),
      concepto: p.concepto,
      monto: Number(p.monto),
      estado: p.estado,
      registradoPor: p.registrado_por,
    })),
  };
}

// POST /api/students  — crea alumno (pagos [] al inicio)
router.post("/", async (req, res) => {
  const s = req.body;
  await pool.query(
    `INSERT INTO alumnos (id, nombre, no_control, grupo, nivel, telefono, correo, estado, fecha_inscripcion, modalidad_pago, avance)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [s.id, s.nombre, s.no_control, s.grupo, s.nivel, s.telefono, s.correo, s.estado || "Activo",
     s.fecha_inscripcion, s.modalidad_pago, JSON.stringify(s.avance || {})]
  );
  res.status(201).json(s);
});

// PATCH /api/students/:id — actualiza campos + avance; sincroniza pagos completos (el front siempre manda el arreglo completo)
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const s = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE alumnos SET nombre=$1, no_control=$2, grupo=$3, nivel=$4, telefono=$5, correo=$6,
       estado=$7, fecha_inscripcion=$8, modalidad_pago=$9, avance=$10 WHERE id=$11`,
      [s.nombre, s.no_control, s.grupo, s.nivel, s.telefono, s.correo, s.estado,
       s.fecha_inscripcion, s.modalidad_pago, JSON.stringify(s.avance || {}), id]
    );

    if (Array.isArray(s.pagos)) {
      const { rows: existentes } = await client.query("SELECT id FROM pagos WHERE alumno_id = $1", [id]);
      const idsExistentes = new Set(existentes.map(r => r.id));
      const idsNuevos = new Set(s.pagos.map(p => p.id));

      for (const p of s.pagos) {
        if (idsExistentes.has(p.id)) {
          await client.query(
            `UPDATE pagos SET fecha=$1, concepto=$2, monto=$3, estado=$4, registrado_por=$5 WHERE id=$6`,
            [p.fecha, p.concepto, p.monto, p.estado, p.registradoPor || null, p.id]
          );
        } else {
          await client.query(
            `INSERT INTO pagos (id, alumno_id, fecha, concepto, monto, estado, registrado_por) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [p.id, id, p.fecha, p.concepto, p.monto, p.estado, p.registradoPor || null]
          );
        }
      }
      for (const existingId of idsExistentes) {
        if (!idsNuevos.has(existingId)) {
          await client.query("DELETE FROM pagos WHERE id = $1", [existingId]);
        }
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  const { rows: [alumno] } = await pool.query("SELECT * FROM alumnos WHERE id = $1", [id]);
  const { rows: pagos } = await pool.query("SELECT * FROM pagos WHERE alumno_id = $1 ORDER BY fecha ASC", [id]);
  res.json(serializeStudent(alumno, pagos));
});

// DELETE /api/students/:id
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM alumnos WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

module.exports = router;
