const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
  const [usuarios, alumnos, pagos, profesores, materiales, ventas, cajaChica] = await Promise.all([
    pool.query("SELECT id, nombre, rol, estado FROM usuarios ORDER BY created_at ASC"),
    pool.query("SELECT * FROM alumnos ORDER BY created_at ASC"),
    pool.query("SELECT * FROM pagos ORDER BY fecha ASC"),
    pool.query("SELECT * FROM profesores ORDER BY created_at ASC"),
    pool.query("SELECT * FROM materiales ORDER BY created_at ASC"),
    pool.query("SELECT * FROM ventas ORDER BY fecha DESC"),
    pool.query("SELECT * FROM caja_chica ORDER BY fecha ASC"),
  ]);

  const pagosPorAlumno = {};
  for (const p of pagos.rows) {
    if (!pagosPorAlumno[p.alumno_id]) pagosPorAlumno[p.alumno_id] = [];
    pagosPorAlumno[p.alumno_id].push({
      id: p.id,
      fecha: p.fecha.toISOString().slice(0, 10),
      concepto: p.concepto,
      monto: Number(p.monto),
      estado: p.estado,
      registradoPor: p.registrado_por,
    });
  }

  const students = alumnos.rows.map(a => ({
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
    pagos: pagosPorAlumno[a.id] || [],
  }));

  const sales = ventas.rows.map(v => ({
    id: v.id,
    fecha: v.fecha.toISOString().slice(0, 10),
    itemId: v.item_id,
    itemNombre: v.item_nombre,
    cantidad: v.cantidad,
    precioUnitario: Number(v.precio_unitario),
    total: Number(v.total),
    alumno: v.alumno,
    registradoPor: v.registrado_por,
  }));

  const cashbox = cajaChica.rows.map(c => ({
    id: c.id,
    fecha: c.fecha.toISOString().slice(0, 10),
    tipo: c.tipo,
    concepto: c.concepto,
    monto: Number(c.monto),
    registradoPor: c.registrado_por,
  }));

  const materials = materiales.rows.map(m => ({
    id: m.id, nombre: m.nombre, tipo: m.tipo, precio: Number(m.precio), stock: m.stock,
  }));

  res.json({
    users: usuarios.rows,
    students,
    teachers: profesores.rows,
    materials,
    sales,
    cashbox,
  });
});

module.exports = router;
