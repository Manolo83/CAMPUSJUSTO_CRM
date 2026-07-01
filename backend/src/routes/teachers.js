const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.post("/", async (req, res) => {
  const t = req.body;
  await pool.query(
    `INSERT INTO profesores (id, nombre, materia, grupos, telefono, correo, estado) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [t.id, t.nombre, t.materia, t.grupos, t.telefono, t.correo, t.estado || "Activo"]
  );
  res.status(201).json(t);
});

router.patch("/:id", async (req, res) => {
  const t = req.body;
  await pool.query(
    `UPDATE profesores SET nombre=$1, materia=$2, grupos=$3, telefono=$4, correo=$5, estado=$6 WHERE id=$7`,
    [t.nombre, t.materia, t.grupos, t.telefono, t.correo, t.estado, req.params.id]
  );
  res.json(t);
});

router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM profesores WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

module.exports = router;
