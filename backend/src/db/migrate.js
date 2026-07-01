const pool = require("../config/db");

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      rol TEXT NOT NULL DEFAULT 'Socio',
      password_hash TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'Activo',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS alumnos (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      no_control TEXT NOT NULL,
      grupo TEXT,
      nivel TEXT,
      telefono TEXT,
      correo TEXT,
      estado TEXT NOT NULL DEFAULT 'Activo',
      fecha_inscripcion DATE,
      modalidad_pago TEXT,
      avance JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS pagos (
      id TEXT PRIMARY KEY,
      alumno_id TEXT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
      fecha DATE NOT NULL,
      concepto TEXT NOT NULL,
      monto NUMERIC(10,2) NOT NULL,
      estado TEXT NOT NULL DEFAULT 'Pendiente',
      registrado_por TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS profesores (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      materia TEXT,
      grupos TEXT,
      telefono TEXT,
      correo TEXT,
      estado TEXT NOT NULL DEFAULT 'Activo',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS materiales (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      tipo TEXT,
      precio NUMERIC(10,2) NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS ventas (
      id TEXT PRIMARY KEY,
      fecha DATE NOT NULL,
      item_id TEXT REFERENCES materiales(id),
      item_nombre TEXT,
      cantidad INTEGER NOT NULL,
      precio_unitario NUMERIC(10,2) NOT NULL,
      total NUMERIC(10,2) NOT NULL,
      alumno TEXT,
      registrado_por TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS caja_chica (
      id TEXT PRIMARY KEY,
      fecha DATE NOT NULL,
      tipo TEXT NOT NULL,
      concepto TEXT NOT NULL,
      monto NUMERIC(10,2) NOT NULL,
      registrado_por TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_pagos_alumno ON pagos(alumno_id);
  `);
  console.log("[migrate] esquema verificado / creado");
}

module.exports = migrate;
