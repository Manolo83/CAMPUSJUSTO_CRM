const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const router = express.Router();

function safe(u) {
  const { password_hash, ...rest } = u;
  return rest;
}

router.post("/", async (req, res) => {
  const u = req.body;
  const hash = await bcrypt.hash(u.password, 10);
  const { rows } = await pool.query(
    `INSERT INTO usuarios (id, nombre, rol, password_hash, estado) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [u.id, u.nombre, u.rol, hash, u.estado || "Activo"]
  );
  res.status(201).json(safe(rows[0]));
});

// PATCH /api/users/:id — si viene `password`, se rehashea; si no, se conserva la anterior
router.patch("/:id", async (req, res) => {
  const u = req.body;
  let query, params;
  if (u.password) {
    const hash = await bcrypt.hash(u.password, 10);
    query = `UPDATE usuarios SET nombre=$1, rol=$2, estado=$3, password_hash=$4 WHERE id=$5 RETURNING *`;
    params = [u.nombre, u.rol, u.estado, hash, req.params.id];
  } else {
    query = `UPDATE usuarios SET nombre=$1, rol=$2, estado=$3 WHERE id=$4 RETURNING *`;
    params = [u.nombre, u.rol, u.estado, req.params.id];
  }
  const { rows } = await pool.query(query, params);
  res.json(safe(rows[0]));
});

router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM usuarios WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

module.exports = router;
