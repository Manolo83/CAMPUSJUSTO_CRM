const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.post("/", async (req, res) => {
  const c = req.body;
  await pool.query(
    `INSERT INTO caja_chica (id, fecha, tipo, concepto, monto, registrado_por) VALUES ($1,$2,$3,$4,$5,$6)`,
    [c.id, c.fecha, c.tipo, c.concepto, c.monto, c.registradoPor || null]
  );
  res.status(201).json(c);
});

module.exports = router;
