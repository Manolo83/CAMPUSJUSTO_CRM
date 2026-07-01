require("dotenv").config();
const express = require("express");
const cors = require("cors");

const migrate = require("./db/migrate");
const seedIfEmpty = require("./db/seed");

const authRoutes = require("./routes/auth");
const bootstrapRoutes = require("./routes/bootstrap");
const studentsRoutes = require("./routes/students");
const teachersRoutes = require("./routes/teachers");
const materialsRoutes = require("./routes/materials");
const salesRoutes = require("./routes/sales");
const cashboxRoutes = require("./routes/cashbox");
const usersRoutes = require("./routes/users");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/bootstrap", bootstrapRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/teachers", teachersRoutes);
app.use("/api/materials", materialsRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/cashbox", cashboxRoutes);
app.use("/api/users", usersRoutes);

// Manejador de errores centralizado
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3001;

async function start() {
  await migrate();
  await seedIfEmpty();
  app.listen(PORT, () => console.log(`[server] Campus Justo CRM API escuchando en puerto ${PORT}`));
}

start().catch(err => {
  console.error("Error al iniciar el servidor:", err);
  process.exit(1);
});
