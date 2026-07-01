const bcrypt = require("bcryptjs");
const pool = require("../config/db");

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function seedIfEmpty() {
  const { rows: [{ count }] } = await pool.query("SELECT COUNT(*)::int AS count FROM usuarios");
  if (Number(count) > 0) return; // ya hay datos, no volver a sembrar

  console.log("[seed] base vacía, insertando datos iniciales...");

  // Usuarios (contraseñas hasheadas — cámbialas después del primer login)
  const manuelHash = await bcrypt.hash("manuel2026", 10);
  const luisHash = await bcrypt.hash("luis2026", 10);
  await pool.query(
    `INSERT INTO usuarios (id, nombre, rol, password_hash, estado) VALUES
     ($1,'Manuel','Dueño',$2,'Activo'),
     ($3,'Luis','Socio',$4,'Activo')`,
    [genId(), manuelHash, genId(), luisHash]
  );

  // Profesores
  await pool.query(
    `INSERT INTO profesores (id, nombre, materia, grupos, telefono, correo, estado) VALUES
     ($1,'Mtro. Justo Aurelio López Ruiz','Álgebra y Cálculo','A1, B1','55 1111 2222','j.lopez@institutojusto.mx','Activo'),
     ($2,'Mtra. Ana Sofía Justo Ramírez','Aritmética y Geometría','C1','55 3333 4444','a.justo@institutojusto.mx','Activo')`,
    [genId(), genId()]
  );

  // Materiales
  const materiales = [
    ["Tomo I — Matemáticas de Primer Año", "Tomo", 450, 40],
    ["Tomo II — Matemáticas de Segundo Año", "Tomo", 420, 35],
    ["Tomo III — Matemáticas de Tercer Año", "Tomo", 400, 30],
    ["Cuaderno de Ejercicios — Pensamiento Matemático", "Cuaderno", 180, 50],
    ["Cuaderno de Ejercicios — Aritmética", "Cuaderno", 180, 50],
    ["Cuaderno de Ejercicios — Álgebra", "Cuaderno", 180, 50],
    ["Cuaderno de Ejercicios — Geometría", "Cuaderno", 180, 50],
    ["Cuaderno de Ejercicios — Trigonometría", "Cuaderno", 180, 50],
    ["Cuaderno de Ejercicios — Funciones", "Cuaderno", 180, 50],
    ["Cuaderno de Ejercicios — Cálculo", "Cuaderno", 180, 50],
  ];
  for (const [nombre, tipo, precio, stock] of materiales) {
    await pool.query(
      `INSERT INTO materiales (id, nombre, tipo, precio, stock) VALUES ($1,$2,$3,$4,$5)`,
      [genId(), nombre, tipo, precio, stock]
    );
  }

  // Alumnos + pagos
  const alumnos = [
    {
      nombre: "María Fernanda López Torres", no_control: "IJ-2026-001", grupo: "A1", nivel: "B",
      telefono: "55 1234 5678", correo: "mariaf.lopez@correo.com", fecha_inscripcion: "2026-02-03",
      modalidad_pago: "Mensual",
      avance: { diagnostico: "completado", aritmetica: "completado", algebra: "progreso" },
      pagos: [
        { fecha: "2026-02-03", concepto: "Inscripción", monto: 1500, estado: "Pagado" },
        { fecha: "2026-03-01", concepto: "Mensualidad marzo", monto: 2400, estado: "Pagado" },
        { fecha: "2026-04-01", concepto: "Mensualidad abril", monto: 2400, estado: "Pendiente" },
      ],
    },
    {
      nombre: "Diego Armando Ruiz Santos", no_control: "IJ-2026-002", grupo: "B1", nivel: "A",
      telefono: "55 8765 4321", correo: "diego.ruiz@correo.com", fecha_inscripcion: "2026-02-05",
      modalidad_pago: "Semanal",
      avance: { diagnostico: "completado", aritmetica: "progreso" },
      pagos: [
        { fecha: "2026-02-05", concepto: "Inscripción", monto: 1500, estado: "Pagado" },
        { fecha: "2026-04-06", concepto: "Semana 9", monto: 600, estado: "Pendiente" },
      ],
    },
    {
      nombre: "Ana Sofía Hernández Cruz", no_control: "IJ-2026-003", grupo: "C1", nivel: "C",
      telefono: "55 2468 1357", correo: "ana.hernandez@correo.com", fecha_inscripcion: "2026-02-03",
      modalidad_pago: "Mensual",
      avance: { diagnostico: "completado", aritmetica: "completado", algebra: "completado", geometria: "completado", trigonometria: "progreso" },
      pagos: [
        { fecha: "2026-02-03", concepto: "Inscripción", monto: 1500, estado: "Pagado" },
        { fecha: "2026-03-01", concepto: "Mensualidad marzo", monto: 2400, estado: "Pagado" },
        { fecha: "2026-04-01", concepto: "Mensualidad abril", monto: 2400, estado: "Pagado" },
      ],
    },
  ];

  for (const a of alumnos) {
    const alumnoId = genId();
    await pool.query(
      `INSERT INTO alumnos (id, nombre, no_control, grupo, nivel, telefono, correo, estado, fecha_inscripcion, modalidad_pago, avance)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'Activo',$8,$9,$10)`,
      [alumnoId, a.nombre, a.no_control, a.grupo, a.nivel, a.telefono, a.correo, a.fecha_inscripcion, a.modalidad_pago, JSON.stringify(a.avance)]
    );
    for (const p of a.pagos) {
      await pool.query(
        `INSERT INTO pagos (id, alumno_id, fecha, concepto, monto, estado) VALUES ($1,$2,$3,$4,$5,$6)`,
        [genId(), alumnoId, p.fecha, p.concepto, p.monto, p.estado]
      );
    }
  }

  // Caja chica — fondo inicial
  await pool.query(
    `INSERT INTO caja_chica (id, fecha, tipo, concepto, monto, registrado_por) VALUES ($1, CURRENT_DATE, 'Entrada', 'Fondo inicial de caja chica', 2000, 'Manuel')`,
    [genId()]
  );

  console.log("[seed] datos iniciales insertados");
}

module.exports = seedIfEmpty;
