# Histórico de Incidencias Operacionales – Retorno de Reparto

Aplicación web con **almacenamiento persistente en la nube (Vercel + PostgreSQL)** para el control, trazabilidad histórica y análisis de **KPIs operacionales de retorno de reparto**.

Al vincular la base de datos en **Vercel Storage**, **ningún dato se pierde aunque se borre el caché del navegador, se formatee el computador o se ingrese desde distintos equipos**, soportando cientos de miles de registros en tiempo real.

---

## Estructura del proyecto

```text
control-incidencias-retorno/
├── api/
│   └── data.js      # API Serverless de Vercel (PostgreSQL auto-inicializable)
├── index.html       # Aplicación principal con sincronización en la nube
├── favicon.png      # Ícono de pestaña del navegador
├── vercel.json      # Configuración de funciones serverless, rutas y seguridad
├── package.json     # Dependencia PostgreSQL (postgres) para Vercel
├── .gitignore       # Exclusiones de Git
└── README.md        # Guía paso a paso de despliegue y base de datos
```

---

## Paso a paso: Subir a GitHub + Activar Base de Datos en Vercel

### Paso 1: Subir todos los archivos a GitHub
1. Ingresa a [github.com/new](https://github.com/new) y crea un repositorio (ej. `control-incidencias-retorno`).
2. Haz clic en **"uploading an existing file"**.
3. Selecciona y arrastra **toda el contenido** de esta carpeta (incluyendo la carpeta **`api/`** con `data.js`, `index.html`, `favicon.png`, `vercel.json`, `package.json`, `.gitignore` y `README.md`).
4. Haz clic en **"Commit changes"**.

### Paso 2: Importar el proyecto en Vercel
1. Ingresa a [vercel.com/new](https://vercel.com/new) con tu cuenta de GitHub.
2. Selecciona el repositorio `control-incidencias-retorno` y pulsa **"Import"** → **"Deploy"**.

### Paso 3: Conectar la Base de Datos Permanente dentro de Vercel (Gratis, en 3 clics)
1. Dentro de tu proyecto en Vercel, haz clic en la pestaña superior **"Storage"**.
2. Pulsa **"Create Database"** → selecciona **"Neon (Serverless Postgres)"** (plan gratuito de 512 MB, capacidad para cientos de miles de incidencias) → **"Continue"**.
3. Pulsa **"Connect Project"** (Vercel agregará automáticamente la variable `DATABASE_URL` / `POSTGRES_URL`) y ve a **Deployments → Redeploy**.

¡Listo! Al abrir tu enlace `https://...vercel.app`:
- El servidor creará automáticamente las tablas `incidencias`, `personal_timecard` y `custom_categories` y cargará los **81 funcionarios originales del Timecard**.
- En la esquina superior derecha verás el botón en verde **`Nube activa (PostgreSQL)`**.
