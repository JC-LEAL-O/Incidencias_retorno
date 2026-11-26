const postgres = require('postgres');

const DELETE_PASSWORD = process.env.DELETE_PASSWORD || 'RETORNO2027';
const TIMECARD_ORIGINAL = [["Yeison Gonzalez","9601562","EXTERNO"],["Williams Aravena","4315829","COURIER I"],["Tomas Araya","4550116","HANDLER ON ROAD"],["Sebastian Soto","3636764","HANDLER I"],["Sebastian Rojas","5147921","EXTERNO"],["Salvador Frez","3836119","COURIER II"],["Rodrigo Garcia","4396439","COURIER II"],["Raul Ceballos","6568276","EXTERNO"],["Quesny Cherenfant","3635943","COURIER II"],["Patricio Poblete","4273714","HANDLER ON ROAD"],["Patricia Serrano","4031455","COURIER II"],["Pablo Arroyo","4235632","OSA"],["Michael Sepulveda","4285050","COURIER II"],["Michael Cardenas","5116446","EXTERNO"],["Maurice Petit_Phart","3636958","HANDLER ON ROAD"],["Matias Del Bel","4273766","COURIER II"],["Martin Solano","8874145","COURIER I"],["Mario Duarte","945447","COURIER III"],["Maria Montenegro","4672633","OSA"],["Macelo Bastias","6219747","HANDLER I"],["Luis Vasquez","3636814","HANDLER ON ROAD"],["Leandro Vergara","3636848","HANDLER ON ROAD"],["Julio Lobos","6269972","EXTERNO"],["Juan Soto","3635956","COURIER II"],["Jose Caicedo","6269970","EXTERNO"],["Jose Banados","4281161","HANDLER ON ROAD"],["Jonathan Oliva","5485577","COURIER I"],["Jean Olate","4393060","COURIER II"],["Ivar Grau","4211394","COURIER I"],["Ignacio Azua","3635697","COURIER I"],["Humberto Zapata","5405113","HANDLER ON ROAD"],["Gonzalo Rojas","6042231","COURIER I"],["Felix Ramos","5230813","EXTERNO"],["Fermin Verdugo","1642863","HANDLER ON ROAD"],["Federico Araneda","4152331","COURIER II"],["Fabian Perez","6568275","EXTERNO"],["Esteban Loncon","6041910","HANDLER ON ROAD"],["Enor Caicedo","5710643","EXTERNO"],["Edinson Ampuero","5465209","HANDLER ON ROAD"],["Douglas Letelier","5079849","EXTERNO"],["Diego Silvera","3635910","COURIER II"],["Diego Muñoz","6067729","COURIER II"],["Diego Alvarez","6126210","HANDLER ON ROAD"],["Diego rojas","5079811","EXTERNO"],["Daniel Ibañez","5106552","EXTERNO"],["Cristian Orellana","3635847","COURIER I"],["Carlos Ibarra","5601693","EXTERNO"],["Claudio Tapia","6269974","EXTERNO"],["Claudio Gonzalez","3635779","COURIER II"],["Carlos Soto","9762038","EXTERNO"],["Carlos Gonzalez","3635949","COURIER I"],["Carlos Benitez","4279994","COURIER I"],["Brian Rua","6280606","EXTERNO"],["Camilo Cruz","5618636","HANDLER ON ROAD"],["Brian Tapia","3890427","COURIER I"],["Brian Mondaca","3636580","HANDLER ON ROAD"],["Bairon Cartagena","6067748","COURIER I"],["Andres Bustamante","3635722","COURIER II"],["Anderson Gomez","4396772","HANDLER ON ROAD"],["alexon Caicedo","6723307","EXTERNO"],["Alexis Morales","3635830","COURIER I"],["Alex Duran","4619213","COURIER I"],["Alejandro Pinilla","3636658","HANDLER I"],["Arturo Miranda","4953996","HANDLER NOCHE"],["Angelo Gamboa","5817043","HANDLER NOCHE"],["Sebastian Gonzalez","4627089","HANDLER NOCHE"],["Rodrigo Palominos","5590428","HANDLER NOCHE"],["Juan Estay","6513593","HANDLER NOCHE"],["Roberto Salazar","5996267","HANDLER NOCHE"],["Hugo Morales","3636585","HANDLER NOCHE"],["Erick Barra","4542101","HANDLER NOCHE"],["Jonathan Nilo","5996204","HANDLER NOCHE"],["Jaime Prado","3636668","HANDLER NOCHE"],["Claudio Bello","3636333","HANDLER NOCHE"],["Gabriel Tapia","4953935","HANDLER NOCHE"],["Luis Cavieres","3636382","HANDLER NOCHE"],["Juan Rios","3636673","HANDLER NOCHE"],["Bairon Leal","9808498","HANDLER NOCHE"],["Ricardo Tarifeño","9781481","HANDLER NOCHE"],["Alan Briceño","9433046","HANDLER NOCHE"],["Vannia Toloza","4224225","HANDLER AM"]];

function getConnUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.NEON_DATABASE_URL ||
    ''
  ).trim();
}

let sqlClient = null;
let schemaReady = false;

function getSql() {
  const url = getConnUrl();
  if (!url) return null;
  if (!sqlClient) {
    const isLocal = /localhost|127\.0\.0\.1/.test(url);
    sqlClient = postgres(url, {
      ssl: isLocal ? false : 'require',
      max: 3,
      idle_timeout: 20,
      connect_timeout: 15,
      prepare: false
    });
  }
  return sqlClient;
}

function titleCase(s) {
  return String(s || '')
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(w => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

async function ensureSchema(sql) {
  if (schemaReady) return;

  await sql`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS incidencias (
      id TEXT PRIMARY KEY,
      ot TEXT NOT NULL,
      fecha TEXT NOT NULL,
      repartidor TEXT NOT NULL,
      id_repartidor TEXT NOT NULL DEFAULT '',
      cargo TEXT NOT NULL DEFAULT '',
      clasificacion TEXT NOT NULL,
      dex TEXT NOT NULL DEFAULT 'SIN DEX',
      bultos TEXT NOT NULL DEFAULT '1',
      boletin TEXT NOT NULL DEFAULT 'No aplica',
      estado_boletin TEXT NOT NULL DEFAULT '',
      folio TEXT NOT NULL DEFAULT '',
      responsable TEXT NOT NULL DEFAULT '',
      observacion TEXT NOT NULL DEFAULT '',
      creado TEXT NOT NULL DEFAULT '',
      actualizado TEXT NOT NULL DEFAULT '',
      historial JSONB NOT NULL DEFAULT '[]'::jsonb
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_inc_fecha ON incidencias (fecha DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_inc_ot ON incidencias (ot)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_inc_rep ON incidencias (id_repartidor)`;

  await sql`
    CREATE TABLE IF NOT EXISTS personal_timecard (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      cargo TEXT NOT NULL DEFAULT ''
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS custom_categories (
      nombre TEXT PRIMARY KEY
    )
  `;

  // Semilla inicial automática del Timecard original solo la primera vez
  const seeded = await sql`SELECT value FROM app_meta WHERE key = 'seeded_timecard'`;
  if (!seeded.length) {
    const existingCount = await sql`SELECT COUNT(*)::int AS n FROM personal_timecard`;
    if ((existingCount[0]?.n || 0) === 0) {
      const seedRows = TIMECARD_ORIGINAL
        .map(([n, id, c]) => ({
          id: String(id || '').trim(),
          nombre: titleCase(n),
          cargo: String(c || '').trim().toUpperCase()
        }))
        .filter(p => p.id && p.nombre);

      if (seedRows.length) {
        await sql`
          INSERT INTO personal_timecard ${sql(seedRows, 'id', 'nombre', 'cargo')}
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }
    await sql`
      INSERT INTO app_meta (key, value)
      VALUES ('seeded_timecard', '1')
      ON CONFLICT (key) DO UPDATE SET value = '1'
    `;
  }

  schemaReady = true;
}

function normalizeRecord(r) {
  return {
    id: String(r.id || '').trim(),
    ot: String(r.ot || '').trim(),
    fecha: String(r.fecha || '').trim(),
    repartidor: String(r.repartidor || '').trim(),
    id_repartidor: String(r.id_repartidor || '').trim(),
    cargo: String(r.cargo || '').trim(),
    clasificacion: String(r.clasificacion || '').trim(),
    dex: String(r.dex || 'SIN DEX').trim(),
    bultos: String(r.bultos || '1').trim(),
    boletin: String(r.boletin || 'No aplica').trim(),
    estado_boletin: String(r.estado_boletin || '').trim(),
    folio: String(r.folio || '').trim(),
    responsable: String(r.responsable || '').trim(),
    observacion: String(r.observacion || '').trim(),
    creado: String(r.creado || new Date().toISOString()).trim(),
    actualizado: String(r.actualizado || new Date().toISOString()).trim(),
    historial: Array.isArray(r.historial) ? r.historial : []
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const sql = getSql();
  if (!sql) {
    return res.status(200).json({
      cloud: false,
      reason: 'missing_db_url',
      message: 'Base de datos PostgreSQL aún no vinculada en Vercel Storage.'
    });
  }

  try {
    await ensureSchema(sql);

    if (req.method === 'GET') {
      const [incRows, perRows, catRows, metaRows] = await Promise.all([
        sql`SELECT * FROM incidencias ORDER BY fecha DESC, creado DESC`,
        sql`SELECT id, nombre, cargo FROM personal_timecard ORDER BY nombre ASC`,
        sql`SELECT nombre FROM custom_categories ORDER BY nombre ASC`,
        sql`SELECT key, value FROM app_meta`
      ]);

      const meta = Object.fromEntries(metaRows.map(m => [m.key, m.value]));
      const records = incRows.map(r => ({
        ...r,
        historial: typeof r.historial === 'string' ? JSON.parse(r.historial || '[]') : (r.historial || [])
      }));

      let authUsers = null, rolePerms = null;
      try { if (meta.auth_users) authUsers = JSON.parse(meta.auth_users); } catch {}
      try { if (meta.role_perms) rolePerms = JSON.parse(meta.role_perms); } catch {}

      return res.status(200).json({
        cloud: true,
        records,
        personal: perRows,
        customCats: catRows.map(c => c.nombre),
        timecardSource: meta.timecard_source || '',
        authUsers,
        rolePerms
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { action } = body;

    if (action === 'upsert_record') {
      const rec = normalizeRecord(body.record || {});
      if (!rec.id || !rec.ot || !rec.fecha) {
        return res.status(400).json({ error: 'Datos de incidencia incompletos.' });
      }
      await sql`
        INSERT INTO incidencias (
          id, ot, fecha, repartidor, id_repartidor, cargo, clasificacion,
          dex, bultos, boletin, estado_boletin, folio, responsable,
          observacion, creado, actualizado, historial
        ) VALUES (
          ${rec.id}, ${rec.ot}, ${rec.fecha}, ${rec.repartidor}, ${rec.id_repartidor},
          ${rec.cargo}, ${rec.clasificacion}, ${rec.dex}, ${rec.bultos}, ${rec.boletin},
          ${rec.estado_boletin}, ${rec.folio}, ${rec.responsable}, ${rec.observacion},
          ${rec.creado}, ${rec.actualizado}, ${sql.json(rec.historial)}
        )
        ON CONFLICT (id) DO UPDATE SET
          ot = EXCLUDED.ot,
          fecha = EXCLUDED.fecha,
          repartidor = EXCLUDED.repartidor,
          id_repartidor = EXCLUDED.id_repartidor,
          cargo = EXCLUDED.cargo,
          clasificacion = EXCLUDED.clasificacion,
          dex = EXCLUDED.dex,
          bultos = EXCLUDED.bultos,
          boletin = EXCLUDED.boletin,
          estado_boletin = EXCLUDED.estado_boletin,
          folio = EXCLUDED.folio,
          responsable = EXCLUDED.responsable,
          observacion = EXCLUDED.observacion,
          actualizado = EXCLUDED.actualizado,
          historial = EXCLUDED.historial
      `;
      return res.status(200).json({ ok: true });
    }

    if (action === 'bulk_upsert_records') {
      const list = Array.isArray(body.records) ? body.records.map(normalizeRecord).filter(r => r.id && r.ot && r.fecha) : [];
      const replaceAll = Boolean(body.replaceAll);

      await sql.begin(async tx => {
        if (replaceAll) {
          await tx`DELETE FROM incidencias`;
        }
        for (const rec of list) {
          await tx`
            INSERT INTO incidencias (
              id, ot, fecha, repartidor, id_repartidor, cargo, clasificacion,
              dex, bultos, boletin, estado_boletin, folio, responsable,
              observacion, creado, actualizado, historial
            ) VALUES (
              ${rec.id}, ${rec.ot}, ${rec.fecha}, ${rec.repartidor}, ${rec.id_repartidor},
              ${rec.cargo}, ${rec.clasificacion}, ${rec.dex}, ${rec.bultos}, ${rec.boletin},
              ${rec.estado_boletin}, ${rec.folio}, ${rec.responsable}, ${rec.observacion},
              ${rec.creado}, ${rec.actualizado}, ${tx.json(rec.historial)}
            )
            ON CONFLICT (id) DO UPDATE SET
              ot = EXCLUDED.ot,
              fecha = EXCLUDED.fecha,
              repartidor = EXCLUDED.repartidor,
              id_repartidor = EXCLUDED.id_repartidor,
              cargo = EXCLUDED.cargo,
              clasificacion = EXCLUDED.clasificacion,
              dex = EXCLUDED.dex,
              bultos = EXCLUDED.bultos,
              boletin = EXCLUDED.boletin,
              estado_boletin = EXCLUDED.estado_boletin,
              folio = EXCLUDED.folio,
              responsable = EXCLUDED.responsable,
              observacion = EXCLUDED.observacion,
              actualizado = EXCLUDED.actualizado,
              historial = EXCLUDED.historial
          `;
        }
      });

      return res.status(200).json({ ok: true, count: list.length });
    }

    if (action === 'delete_record') {
      const id = String(body.id || '').trim();
      if (!id) return res.status(400).json({ error: 'ID requerido.' });
      await sql`DELETE FROM incidencias WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    if (action === 'save_auth_config') {
      if (Array.isArray(body.authUsers)) {
        await sql`
          INSERT INTO app_meta (key, value)
          VALUES ('auth_users', ${JSON.stringify(body.authUsers)})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `;
      }
      if (body.rolePerms && typeof body.rolePerms === 'object') {
        await sql`
          INSERT INTO app_meta (key, value)
          VALUES ('role_perms', ${JSON.stringify(body.rolePerms)})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `;
      }
      return res.status(200).json({ ok: true });
    }

    if (action === 'upsert_person') {
      const p = body.person || {};
      const origId = String(body.origId || '').trim();
      const id = String(p.id || '').trim();
      const nombre = titleCase(p.nombre || '');
      const cargo = String(p.cargo || '').trim().toUpperCase();
      if (!id || !nombre) return res.status(400).json({ error: 'ID y nombre son requeridos.' });

      await sql.begin(async tx => {
        if (origId && origId !== id) {
          await tx`DELETE FROM personal_timecard WHERE id = ${origId}`;
          await tx`
            UPDATE incidencias
            SET id_repartidor = ${id}, repartidor = ${nombre}, cargo = ${cargo}
            WHERE id_repartidor = ${origId}
          `;
        } else if (origId) {
          await tx`
            UPDATE incidencias
            SET repartidor = ${nombre}, cargo = ${cargo}
            WHERE id_repartidor = ${id}
          `;
        }
        await tx`
          INSERT INTO personal_timecard (id, nombre, cargo)
          VALUES (${id}, ${nombre}, ${cargo})
          ON CONFLICT (id) DO UPDATE SET
            nombre = EXCLUDED.nombre,
            cargo = EXCLUDED.cargo
        `;
      });

      return res.status(200).json({ ok: true });
    }

    if (action === 'delete_person') {
      const id = String(body.id || '').trim();
      if (!id) return res.status(400).json({ error: 'ID requerido.' });
      await sql`DELETE FROM personal_timecard WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    if (action === 'replace_personal') {
      const list = Array.isArray(body.personal)
        ? body.personal
            .map(p => ({
              id: String(p.id || '').trim(),
              nombre: titleCase(p.nombre || ''),
              cargo: String(p.cargo || '').trim().toUpperCase()
            }))
            .filter(p => p.id && p.nombre)
        : [];
      const source = String(body.source || '').trim();

      await sql.begin(async tx => {
        await tx`DELETE FROM personal_timecard`;
        if (list.length) {
          await tx`INSERT INTO personal_timecard ${tx(list, 'id', 'nombre', 'cargo')} ON CONFLICT (id) DO NOTHING`;
        }
        await tx`
          INSERT INTO app_meta (key, value)
          VALUES ('timecard_source', ${source})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `;
      });

      return res.status(200).json({ ok: true, count: list.length });
    }

    if (action === 'sync_custom_cats') {
      const cats = Array.isArray(body.customCats)
        ? body.customCats.map(c => String(c || '').trim()).filter(Boolean)
        : [];
      for (const nombre of cats) {
        await sql`INSERT INTO custom_categories (nombre) VALUES (${nombre}) ON CONFLICT DO NOTHING`;
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: `Acción desconocida: ${action}` });
  } catch (err) {
    console.error('Error en /api/data:', err);
    return res.status(500).json({
      error: 'Error de base de datos',
      detail: err?.message || String(err)
    });
  }
};
