const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// PATCH /api/materials/:id  { precio }
router.patch("/:id", async (req, res) => {
  const { precio } = req.body;
  const { rows } = await pool.query(
    "UPDATE materiales SET precio = $1 WHERE id = $2 RETURNING *",
    [precio, req.params.id]
  );
  const m = rows[0];
  res.json({ id: m.id, nombre: m.nombre, tipo: m.tipo, precio: Number(m.precio), stock: m.stock });
});

module.exports = router;
