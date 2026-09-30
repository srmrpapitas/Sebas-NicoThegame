/* Ranking global — Cloudflare Pages Function + D1 (binding DB).
 *
 *   GET  /api/scores?mode=distance|score&limit=20[&me=@handle]
 *        -> { mode, top:[{rank,handle,value,avatar,plays}], me:{rank,value}|null }
 *   POST /api/scores  { handle, distance, score, avatar }
 *        -> { ok, best:{distance,score}, rank:{distance,score} }
 *
 * Solo se guarda la MEJOR marca de cada @ por modo. Las marcas imposibles
 * se rechazan (no es anti-trampas perfecto, pero frena lo evidente).
 */

const MODES = ['distance', 'score'];
const MAX = { distance: 200000, score: 2000000 };   // topes de cordura
const AVATARS = ['player', 'sebastian', 'nico', 'leo', 'runner'];

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  },
});

/* Normaliza un @ de Instagram: minúsculas, sin @, solo letras/números/._ */
export function cleanHandle(raw) {
  if (typeof raw !== 'string') return null;
  const h = raw.trim().replace(/^@+/, '').toLowerCase();
  if (!/^[a-z0-9._]{1,30}$/.test(h)) return null;
  if (/^\.|\.$|\.\./.test(h)) return null;
  return h;
}

async function rankOf(db, mode, value) {
  const r = await db.prepare('SELECT COUNT(*) AS n FROM scores WHERE mode = ? AND value > ?')
    .bind(mode, value).first();
  return (r ? r.n : 0) + 1;
}

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ error: 'db_not_bound' }, 503);
  const url = new URL(request.url);
  const mode = MODES.includes(url.searchParams.get('mode')) ? url.searchParams.get('mode') : 'distance';
  const limit = Math.max(1, Math.min(50, parseInt(url.searchParams.get('limit') || '20', 10) || 20));

  const { results } = await env.DB.prepare(
    'SELECT handle, value, avatar, plays FROM scores WHERE mode = ? ORDER BY value DESC, updated_at ASC LIMIT ?'
  ).bind(mode, limit).all();
  const top = (results || []).map((r, i) => ({ rank: i + 1, ...r }));

  let me = null;
  const h = cleanHandle(url.searchParams.get('me') || '');
  if (h) {
    const row = await env.DB.prepare('SELECT value FROM scores WHERE handle = ? AND mode = ?').bind(h, mode).first();
    if (row) me = { handle: h, value: row.value, rank: await rankOf(env.DB, mode, row.value) };
  }
  const total = await env.DB.prepare('SELECT COUNT(*) AS n FROM scores WHERE mode = ?').bind(mode).first();
  return json({ mode, top, me, players: total ? total.n : 0 });
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'db_not_bound' }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad_json' }, 400); }

  const handle = cleanHandle(body && body.handle);
  if (!handle) return json({ error: 'bad_handle' }, 400);
  const avatar = AVATARS.includes(body.avatar) ? body.avatar : 'player';
  const now = Date.now();

  const vals = {};
  for (const m of MODES) {
    const v = Math.floor(Number(body[m]));
    if (!Number.isFinite(v) || v < 0 || v > MAX[m]) return json({ error: 'bad_' + m }, 400);
    vals[m] = v;
  }

  const stmt = env.DB.prepare(
    `INSERT INTO scores (handle, mode, value, avatar, plays, updated_at)
     VALUES (?1, ?2, ?3, ?4, 1, ?5)
     ON CONFLICT (handle, mode) DO UPDATE SET
       plays = plays + 1,
       avatar = excluded.avatar,
       updated_at = CASE WHEN excluded.value > value THEN excluded.updated_at ELSE updated_at END,
       value = MAX(value, excluded.value)`
  );
  await env.DB.batch(MODES.map(m => stmt.bind(handle, m, vals[m], avatar, now)));

  const best = {}, rank = {};
  for (const m of MODES) {
    const row = await env.DB.prepare('SELECT value FROM scores WHERE handle = ? AND mode = ?').bind(handle, m).first();
    best[m] = row ? row.value : vals[m];
    rank[m] = await rankOf(env.DB, m, best[m]);
  }
  return json({ ok: true, handle, best, rank });
}
