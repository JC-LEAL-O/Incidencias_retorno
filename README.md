# Histórico de Incidencias Operacionales – Retorno de Reparto

Aplicación web estática (HTML + Tailwind CSS + Chart.js + SheetJS) para el registro estandarizado, trazabilidad histórica y análisis de **KPIs operacionales de retorno de reparto**.

## Características principales

- **Formulario de ingreso estandarizado (10 campos):** OT/Master, Repartidor e ID bidireccionales con filtro dinámico letra por letra, Fecha, Clasificación (con opción *Otros*), Código DEX/DECK con explicación integrada, Bultos, Boletín de ocurrencias, Estado del boletín y Responsable.
- **Base de personal Timecard integrada:** Gestión completa para agregar, modificar, eliminar, actualizar desde Excel (`.xlsx`) o restaurar la nómina original.
- **Histórico auditable:** Filtros por Día, Semana, Mes, Año (2026+), Rango de fechas personalizado y Todo el historial; bitácora de modificaciones por incidencia.
- **Dashboard KPI interactivo:** 12 indicadores en tiempo real, análisis de Pareto de códigos DEX, distribución por clasificación y cargo, ranking de riesgo por repartidor y exportación/importación Excel y JSON.

---

## Estructura del proyecto

```text
control-incidencias-retorno/
├── index.html       # Aplicación principal autocontenida
├── favicon.png      # Ícono de pestaña del navegador
├── vercel.json      # Configuración de despliegue y cabeceras para Vercel
├── package.json     # Metadatos del proyecto
├── .gitignore       # Archivos excluidos de Git
└── README.md        # Documentación y guía de despliegue
```

---

## Cómo subir a GitHub y publicar en Vercel

### Opción A: Sin instalar nada (desde el navegador web)

1. **Subir a GitHub:**
   - Ingresa a [github.com/new](https://github.com/new) y crea un repositorio nuevo (por ejemplo `control-incidencias-retorno`, público o privado).
   - En la pantalla del repositorio vacío haz clic en **"uploading an existing file"**.
   - Arrastra todos los archivos de esta carpeta (`index.html`, `favicon.png`, `vercel.json`, `package.json`, `.gitignore`, `README.md`).
   - Haz clic en **"Commit changes"**.

2. **Publicar en Vercel:**
   - Ingresa a [vercel.com/new](https://vercel.com/new) e inicia sesión con tu cuenta de GitHub.
   - Selecciona el repositorio `control-incidencias-retorno` y pulsa **"Import"**.
   - Deja las opciones por defecto (*Framework Preset: Other*) y haz clic en **"Deploy"**.
   - En pocos segundos obtendrás tu enlace público `https://...vercel.app` (cada cambio futuro en GitHub actualizará el sitio automáticamente).

### Opción B: Usando Git por terminal

```bash
cd "C:\Users\3630691\.gemini\antigravity\scratch\control-incidencias-retorno"
git init
git add .
git commit -m "chore: versión inicial Histórico de Incidencias y KPIs"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/control-incidencias-retorno.git
git push -u origin main
```

> **Nota sobre almacenamiento de datos:** Los registros se almacenan localmente en el navegador (`localStorage`) de cada equipo. Utiliza periódicamente los botones **Exportar Excel** o **Respaldo (JSON)** del encabezado para respaldar o compartir el histórico entre equipos.
