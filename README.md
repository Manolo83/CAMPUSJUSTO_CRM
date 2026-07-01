# Campus Justo CRM

Conversión del prototipo React (localStorage) a app real: **React + Express + PostgreSQL**, lista para desplegar en Railway como proyecto nuevo (dos servicios: `backend` y `frontend`, + Postgres).

## Estructura

```
campusjusto-crm/
├── backend/     → API Express + PostgreSQL (puerto 3001 local)
└── frontend/    → React + Vite (el CRM que ya conocías)
```

## Qué cambió respecto al prototipo

- Los datos ya no viven en `window.storage` (navegador) — viven en Postgres.
- El login ya no compara la contraseña en el navegador: se valida en el servidor con `bcrypt`, y las contraseñas nunca viajan al frontend.
- Toda la lógica de `addStudent`, `updateStudent`, `addPayment`, etc. ahora llama a la API en vez de guardar localmente. La interfaz (todas las pantallas y componentes) **no cambió nada**.
- Al arrancar, el backend crea las tablas automáticamente si no existen (igual que Endulcora) y siembra los mismos datos de ejemplo del prototipo solo si la base está vacía.

## 1. Desarrollo local

### Backend
```bash
cd backend
npm install
cp .env.example .env      # ajusta DATABASE_URL a tu Postgres local
npm run dev                # http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173, apunta a http://localhost:3001 por defecto
```

## 2. Subir a GitHub

Como con Endulcora, crea un repo nuevo (ej. `Manolo83/CAMPUSJUSTO_CRM`) y sube esta carpeta completa (`backend/` y `frontend/` en la raíz del repo).

```bash
git init
git add .
git commit -m "Campus Justo CRM: primera versión full-stack"
git branch -M main
git remote add origin https://github.com/Manolo83/CAMPUSJUSTO_CRM.git
git push -u origin main
```

## 3. Desplegar en Railway (proyecto nuevo, separado de Endulcora)

1. **New Project → Deploy from GitHub repo** → selecciona el repo.
2. Railway detecta el repo pero necesitas **dos servicios**, no uno:
   - Servicio **backend**: en Settings → Root Directory pon `backend`. Railway usará `railway.json` automáticamente (build con Nixpacks, sin healthcheck, igual que Endulcora).
   - Servicio **frontend**: "New" → "GitHub Repo" otra vez sobre el mismo repo → Root Directory `frontend`. Start command: `npm run preview` (o configura un `Static Site` si prefieres servir el `dist/` compilado).
3. **Añade Postgres**: "New" → "Database" → "Add PostgreSQL". Railway te da `DATABASE_URL` automáticamente — solo tienes que "compartirla" con el servicio backend (Settings → Variables → Reference → selecciona la variable de Postgres).
4. **Variables de entorno**:
   - Backend: `DATABASE_URL` (referenciada desde el Postgres), Railway pone `PORT` solo.
   - Frontend: `VITE_API_URL` = URL pública del servicio backend (ej. `https://campusjusto-backend-production.up.railway.app`). Vite necesita esta variable en **build time**, así que después de poner el backend en línea, agrégala en el frontend y vuelve a desplegar (redeploy).
5. Railway desplegará ambos servicios automáticamente en cada `git push`, igual que ya haces con Endulcora.

## 4. Primer login

Usuarios de ejemplo (mismos que el prototipo, pero ahora con contraseña hasheada en la base):
- Manuel / `manuel2026`
- Luis / `luis2026`

Te recomiendo cambiarlas desde la pantalla de Usuarios en cuanto entres la primera vez.

## Notas / pendientes

- El `Descargar respaldo` de la pantalla de Usuarios sigue funcionando igual (exporta lo que hay cargado en memoria del navegador), pero como los datos ya viven en Postgres real, considera además respaldos de base de datos desde Railway (Postgres → Backups).
- Si más adelante quieres roles con más granularidad (como Endulcora nv1–nv4) en vez de solo Dueño/Socio, es un cambio pequeño en la tabla `usuarios` y en `UsuariosView`.
