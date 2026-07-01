const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// POST /api/sales — registra venta y descuenta stock del material en una transacción
router.post("/", async (req, res) => {
  const v = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO ventas (id, fecha, item_id, item_nombre, cantidad, precio_unitario, total, alumno, registrado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [v.id, v.fecha, v.itemId, v.itemNombre, v.cantidad, v.precioUnitario, v.total, v.alumno || "", v.registradoPor || null]
    );

    const { rows: [material] } = await client.query(
      `UPDATE materiales SET stock = GREATEST(0, stock - $1) WHERE id = $2 RETURNING *`,
      [v.cantidad, v.itemId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      sale: v,
      material: material
        ? { id: material.id, nombre: material.nombre, tipo: material.tipo, precio: Number(material.precio), stock: material.stock }
        : null,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

module.exports = router;
