const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const router = express.Router();

// POST /api/auth/login  { id, password }  -> { user }  (sin password_hash)
router.post("/login", async (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) return res.status(400).json({ error: "Faltan credenciales" });

  const { rows } = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);
  const user = rows[0];
  if (!user || user.estado !== "Activo") {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Usuario o contraseña incorrectos" });

  const { password_hash, ...safeUser } = user;
  res.json({ user: safeUser });
});

module.exports = router;
