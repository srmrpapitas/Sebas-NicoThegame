/* =====================================================================
   social.js — todo lo que conecta el juego con Instagram
   ---------------------------------------------------------------------
   · window.__ig       → @ de Instagram del jugador (modal bonito, sin prompt())
   · window.__social   → ranking global (API /api/scores en Cloudflare D1)
                         y tarjeta 1080×1920 para compartir en historias
   Se carga como script clásico ANTES del módulo del juego.
   ===================================================================== */
(function(){
  'use strict';

  const IG_KEY   = 'sebRunnerIG';
  const NAME_KEY = 'sebRunnerName';
  const GAME_URL = location.origin + location.pathname.replace(/index\.html$/, '');
  const GAME_HOST = location.host || 'sebas-nicothegame.pages.dev';

  /* ---------- helpers ---------- */
  function ls(k, v){
    try{
      if(v === undefined) return localStorage.getItem(k);
      if(v === null) localStorage.removeItem(k); else localStorage.setItem(k, v);
    }catch(e){ return null; }
  }
  function esc(s){
    return String(s).replace(/[&<>"']/g, c =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function clean(raw){
    const h = String(raw || '').trim().replace(/^@+/, '').toLowerCase();
    if(!/^[a-z0-9._]{1,30}$/.test(h)) return null;
    if(/^\.|\.$|\.\./.test(h)) return null;
    return h;
  }

  /* ---------- estilos ---------- */
  const css = document.createElement('style');
  css.textContent = `
  .ig-modal{position:fixed;inset:0;z-index:300;display:none;align-items:center;justify-content:center;
    background:rgba(5,20,35,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);padding:16px}
  .ig-modal.show{display:flex}
  .ig-card{width:100%;max-width:380px;background:linear-gradient(160deg,#833ab4 0%,#fd1d1d 55%,#fcb045 100%);
    border-radius:24px;padding:3px;box-shadow:0 18px 50px rgba(0,0,0,.45)}
  .ig-inner{background:#0a2540;border-radius:21px;padding:22px 20px 18px;color:#fff;text-align:center}
  .ig-inner h3{font-size:22px;font-weight:800;margin-bottom:6px}
  .ig-inner p{font-size:14px;opacity:.85;line-height:1.35;margin-bottom:16px}
  .ig-field{display:flex;align-items:center;background:#fff;border-radius:14px;padding:0 14px;margin-bottom:8px}
  .ig-field span{color:#833ab4;font-weight:800;font-size:20px}
  .ig-field input{flex:1;border:none;outline:none;font:600 18px 'Fredoka',system-ui,sans-serif;color:#0a2540;
    padding:14px 6px;background:transparent;min-width:0;user-select:text;-webkit-user-select:text}
  .ig-err{color:#ffb3b3;font-size:13px;min-height:18px;margin-bottom:8px}
  .ig-ok{width:100%;padding:14px;border-radius:14px;font-size:17px;font-weight:800;color:#fff;
    background:linear-gradient(90deg,#833ab4,#fd1d1d,#fcb045)}
  .ig-skip{margin-top:10px;font-size:13px;opacity:.7;text-decoration:underline}
  .ig-note{margin-top:12px;font-size:11px;opacity:.55;line-height:1.3}

  .ig-title-pill{margin-top:12px;background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.45);
    color:#fff;padding:8px 16px;border-radius:999px;font-weight:700;font-size:14px}

  .go-global{margin-top:10px;padding:10px 12px;border-radius:14px;background:rgba(131,58,180,.14);
    color:#0a2540;font-weight:700;font-size:14px;text-align:center;line-height:1.35}
  .go-global b{color:#833ab4}
  .go-global button{margin-top:8px;padding:10px 14px;border-radius:12px;color:#fff;font-weight:800;
    background:linear-gradient(90deg,#833ab4,#fd1d1d,#fcb045)}
  .btn-story{background:linear-gradient(90deg,#833ab4,#fd1d1d,#fcb045)!important;color:#fff!important;border-color:transparent!important}
  .btn-link{background:transparent!important;color:#0a2540!important;border:2px solid rgba(10,37,64,.25)!important;font-size:14px!important}

  .rk-status{text-align:center;font-size:12px;opacity:.8;margin:-4px 0 8px;color:#0a2540;font-weight:600}
  #rankingList .ranking-name{color:#0a2540}
  .rk-me{margin-top:10px;padding:10px 12px;border-radius:12px;background:#6a2c91;
    border:2px solid rgba(252,176,69,.6);color:#fff;font-weight:700;font-size:14px;text-align:center}
  .ranking-row.is-me{outline:2px solid #fcb045}

  .story-view{position:fixed;inset:0;z-index:320;display:none;flex-direction:column;align-items:center;
    justify-content:center;background:rgba(0,0,0,.9);padding:16px;gap:12px}
  .story-view.show{display:flex}
  .story-view img{max-height:68vh;max-width:100%;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.6);
    -webkit-touch-callout:default;user-select:auto;-webkit-user-select:auto;pointer-events:auto}
  .story-view .sv-hint{color:#fff;font-size:14px;opacity:.85;text-align:center;max-width:340px}
  .story-view .sv-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
  .story-view button{padding:12px 18px;border-radius:14px;font-weight:800;font-size:15px;color:#fff;
    background:linear-gradient(90deg,#833ab4,#fd1d1d,#fcb045)}
  .story-view button.sv-close{background:rgba(255,255,255,.18)}
  `;
  document.head.appendChild(css);

  /* =====================================================================
     1) @ DE INSTAGRAM
     ===================================================================== */
  const modal = document.createElement('div');
  modal.className = 'ig-modal';
  modal.innerHTML = `
    <div class="ig-card"><div class="ig-inner">
      <h3>📸 ¿Cuál es tu @?</h3>
      <p id="igReason">Pon tu usuario de Instagram para salir en el ranking y que te vean los demás.</p>
      <div class="ig-field"><span>@</span>
        <input id="igInput" type="text" inputmode="text" autocomplete="username" autocapitalize="none"
               autocorrect="off" spellcheck="false" maxlength="31" placeholder="tu_usuario"></div>
      <div class="ig-err" id="igErr"></div>
      <button class="ig-ok" id="igOk">¡Entrar al juego!</button>
      <div><button class="ig-skip" id="igSkip">Jugar sin @ (no sales en el ranking)</button></div>
      <div class="ig-note">Tu @ será visible en el ranking público. No pedimos contraseña ni accedemos a tu cuenta.</div>
    </div></div>`;
  function mount(){ if(document.body) document.body.appendChild(modal); else setTimeout(mount, 20); }
  mount();

  let pending = null;
  function finish(val){
    modal.classList.remove('show');
    const r = pending; pending = null;
    if(r) r(val);
  }
  modal.querySelector('#igOk').addEventListener('click', () => {
    const h = clean(modal.querySelector('#igInput').value);
    if(!h){ modal.querySelector('#igErr').textContent = 'Solo letras, números, puntos y _ (máx. 30).'; return; }
    ig.set(h);
    finish(h);
  });
  modal.querySelector('#igInput').addEventListener('keydown', e => {
    e.stopPropagation();                       // que WASD/espacio no muevan al personaje
    if(e.key === 'Enter') modal.querySelector('#igOk').click();
  });
  modal.querySelector('#igSkip').addEventListener('click', () => {
    ls(IG_KEY + '_skipped', '1');
    if(!ls(NAME_KEY)) ls(NAME_KEY, 'Jugador');
    finish(null);
  });

  const ig = {
    get(){ return clean(ls(IG_KEY)); },
    set(h){
      h = clean(h); if(!h) return;
      ls(IG_KEY, h);
      ls(IG_KEY + '_skipped', null);
      const label = ('@' + h).slice(0, 16);
      ls(NAME_KEY, label);
      try{ if(typeof window.__setPlayerName === 'function') window.__setPlayerName(label); }catch(e){}
      paintTitle();
    },
    skipped(){ return ls(IG_KEY + '_skipped') === '1'; },
    /* Abre el modal. Devuelve Promise<handle|null>. */
    ask(reason){
      if(pending) return new Promise(r => { const prev = pending; pending = v => { prev(v); r(v); }; });
      modal.querySelector('#igReason').textContent =
        reason || 'Pon tu usuario de Instagram para salir en el ranking y que te vean los demás.';
      modal.querySelector('#igErr').textContent = '';
      modal.querySelector('#igInput').value = ig.get() || '';
      modal.classList.add('show');
      setTimeout(() => { try{ modal.querySelector('#igInput').focus(); }catch(e){} }, 60);
      return new Promise(r => { pending = r; });
    },
    /* Pide el @ solo si nunca lo ha puesto ni lo ha saltado. */
    async ensure(reason){
      if(ig.get()) return ig.get();
      if(ig.skipped()) return null;
      return ig.ask(reason);
    },
  };
  window.__ig = ig;

  /* Pastilla "@usuario ✏️" en la portada */
  function paintTitle(){
    const title = document.getElementById('titleScreen');
    if(!title) return;
    let pill = document.getElementById('igTitlePill');
    if(!pill){
      pill = document.createElement('button');
      pill.id = 'igTitlePill';
      pill.className = 'ig-title-pill';
      pill.addEventListener('click', () => ig.ask('Cambia tu @ de Instagram:'));
      const pills = title.querySelector('.title-pills');
      if(pills) pills.insertAdjacentElement('afterend', pill); else title.appendChild(pill);
    }
    const h = ig.get();
    pill.textContent = h ? '📸 @' + h + '  ✏️' : '📸 Pon tu @ de Instagram';
  }
  document.addEventListener('DOMContentLoaded', paintTitle);
  if(document.readyState !== 'loading') setTimeout(paintTitle, 0);

  /* =====================================================================
     2) RANKING GLOBAL
     ===================================================================== */
  const api = {
    async top(mode, limit){
      const me = ig.get();
      const q = '/api/scores?mode=' + encodeURIComponent(mode) + '&limit=' + (limit || 20) + (me ? '&me=' + encodeURIComponent(me) : '');
      const r = await fetch(q, { cache: 'no-store' });
      if(!r.ok) throw new Error('ranking ' + r.status);
      return r.json();
    },
    async submit(run){
      const handle = ig.get();
      if(!handle) return null;
      const r = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ handle, distance: run.distance, score: run.score, avatar: run.avatar }),
      });
      if(!r.ok) throw new Error('submit ' + r.status);
      return r.json();
    },
  };

  /* Pinta el top global dentro del modal de ranking existente.
     Si la API falla, devuelve false y el juego muestra el ranking local. */
  async function renderRanking(listEl, mode){
    let status = listEl.parentElement.querySelector('.rk-status');
    if(!status){
      status = document.createElement('div');
      status.className = 'rk-status';
      listEl.insertAdjacentElement('beforebegin', status);
    }
    let meEl = listEl.parentElement.querySelector('.rk-me');
    if(!meEl){
      meEl = document.createElement('div');
      meEl.className = 'rk-me';
      listEl.insertAdjacentElement('afterend', meEl);
    }
    status.textContent = '🌍 Cargando ranking global…';
    meEl.style.display = 'none';
    try{
      const data = await api.top(mode, 20);
      const me = ig.get();
      listEl.innerHTML = '';
      status.textContent = '🌍 Ranking global · ' + data.players + ' jugador' + (data.players === 1 ? '' : 'es');
      if(!data.top.length){
        listEl.innerHTML = '<div class="ranking-empty">🎮 ¡Nadie ha jugado aún! Sé el primero del ranking.</div>';
      }
      const suffix = mode === 'distance' ? ' m' : '';
      data.top.forEach((e, i) => {
        const row = document.createElement('div');
        const cls = i === 0 ? ' gold' : i === 1 ? ' silver' : i === 2 ? ' bronze' : '';
        row.className = 'ranking-row' + cls + (me && e.handle === me ? ' is-me' : '');
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
        row.innerHTML =
            '<div class="ranking-rank">' + medal + '</div>'
          + '<div class="ranking-name">@' + esc(e.handle) + '</div>'
          + '<div class="ranking-val">' + e.value + suffix + '</div>';
        listEl.appendChild(row);
      });
      if(data.me){
        meEl.style.display = '';
        meEl.textContent = 'Tú (@' + data.me.handle + '): puesto #' + data.me.rank + ' · ' + data.me.value + suffix;
      } else if(!me){
        meEl.style.display = '';
        meEl.innerHTML = '';
        const b = document.createElement('button');
        b.textContent = '📸 Pon tu @ para aparecer aquí';
        b.style.cssText = 'color:#fff;font-weight:800';
        b.addEventListener('click', () => ig.ask().then(() => renderRanking(listEl, mode)));
        meEl.appendChild(b);
      }
      return true;
    }catch(err){
      console.warn('[ranking] global no disponible, uso el local', err);
      status.textContent = '📴 Sin conexión con el ranking global — mostrando tus partidas';
      return false;
    }
  }

  /* Tras cada partida: sube la marca y pinta el resultado en Game Over */
  async function afterRun(run){
    lastRun = run;
    const card = document.querySelector('#gameOverScreen .go-card');
    if(!card) return;
    let box = document.getElementById('goGlobal');
    if(!box){
      box = document.createElement('div');
      box.id = 'goGlobal';
      box.className = 'go-global';
      const btns = card.querySelector('.go-buttons');
      card.insertBefore(box, btns);
    }
    lastRank = null;
    if(!ig.get()){
      box.innerHTML = '¿Quieres salir en el <b>ranking global</b>?<br>';
      const b = document.createElement('button');
      b.textContent = '📸 Poner mi @ y guardar esta partida';
      b.addEventListener('click', async () => {
        const h = await ig.ask('Pon tu @ y guardamos esta partida en el ranking.');
        if(h) afterRun(run);
      });
      box.appendChild(b);
      return;
    }
    box.textContent = '🌍 Guardando en el ranking global…';
    try{
      const res = await api.submit(run);
      lastRank = res.rank;
      const better = run.distance >= res.best.distance;
      box.innerHTML = '🌍 @' + esc(res.handle) + ': puesto <b>#' + res.rank.distance + '</b> en distancia'
        + (better ? ' 🔥' : '') + '<br>Tu mejor marca: <b>' + res.best.distance + ' m</b> · puesto #' + res.rank.score + ' en puntos';
    }catch(err){
      console.warn('[ranking] no se pudo guardar', err);
      box.textContent = '📴 No se pudo guardar en el ranking global (¿sin conexión?).';
    }
  }
  let lastRun = null, lastRank = null;

  /* =====================================================================
     3) TARJETA PARA HISTORIAS (1080×1920)
     ===================================================================== */
  function roundRect(ctx, x, y, w, h, r){
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  async function makeStoryImage(run){
    try{ await document.fonts.load('800 100px Fredoka'); }catch(e){}
    const W = 1080, H = 1920;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    const F = (w, s) => w + ' ' + s + 'px Fredoka, system-ui, sans-serif';

    // Cielo de atardecer en Tenerife
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#2b1055'); g.addColorStop(.45, '#d53369'); g.addColorStop(.75, '#ff8c42'); g.addColorStop(1, '#ffd060');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // Sol
    x.fillStyle = 'rgba(255,230,150,.55)'; x.beginPath(); x.arc(W / 2, 1180, 260, 0, Math.PI * 2); x.fill();
    // Teide
    x.fillStyle = '#3b1f3f';
    x.beginPath(); x.moveTo(0, 1500); x.lineTo(380, 1180); x.lineTo(520, 1060); x.lineTo(600, 1100); x.lineTo(760, 1240); x.lineTo(W, 1450); x.lineTo(W, H); x.lineTo(0, H); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.moveTo(470, 1105); x.lineTo(520, 1060); x.lineTo(600, 1100); x.lineTo(560, 1125); x.lineTo(520, 1105); x.fill();
    // Mar
    x.fillStyle = '#0a4d68'; x.fillRect(0, 1600, W, 320);
    x.fillStyle = 'rgba(255,255,255,.25)';
    for(let i = 0; i < 7; i++) x.fillRect(80 + i * 140, 1660 + (i % 3) * 60, 90, 8);

    x.textAlign = 'center';
    x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 18; x.shadowOffsetY = 6;
    x.fillStyle = '#fff';
    x.font = F(800, 96); x.fillText('SEBASTIÁN', W / 2, 250);
    x.fillStyle = '#ffd60a'; x.font = F(800, 110); x.fillText('RUNNER', W / 2, 365);
    x.fillStyle = '#fff'; x.font = F(600, 44); x.fillText('🌋 Aventura en Tenerife', W / 2, 440);

    // Tarjeta del resultado
    x.shadowBlur = 40; x.shadowOffsetY = 14;
    x.fillStyle = 'rgba(10,37,64,.82)'; roundRect(x, 110, 540, W - 220, 520, 48); x.fill();
    x.shadowBlur = 0; x.shadowOffsetY = 0;
    const h = ig.get();
    x.fillStyle = '#fcb045'; x.font = F(700, 54); x.fillText(h ? '@' + h : '¡Mi récord!', W / 2, 640);
    x.fillStyle = '#fff'; x.font = F(800, 190); x.fillText(run.distance + ' m', W / 2, 850);
    x.font = F(600, 50);
    x.fillText('⭐ ' + run.score + ' puntos   🎟️ ' + run.tickets, W / 2, 950);
    if(lastRank && lastRank.distance){
      x.fillStyle = '#ffd60a'; x.font = F(700, 46);
      x.fillText('🌍 Puesto #' + lastRank.distance + ' del ranking', W / 2, 1025);
    }

    // Llamada a la acción
    x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 16; x.shadowOffsetY = 5;
    x.fillStyle = '#fff'; x.font = F(800, 76); x.fillText('¿Me superas? 😏', W / 2, 1400);
    x.shadowColor = 'transparent'; x.shadowBlur = 0; x.shadowOffsetY = 0;
    x.fillStyle = 'rgba(255,255,255,.95)'; roundRect(x, 190, 1470, W - 380, 100, 50); x.fill();
    x.fillStyle = '#0a2540'; x.font = F(700, 42); x.fillText(GAME_HOST, W / 2, 1535);

    return await new Promise(r => c.toBlob(r, 'image/png'));
  }

  const viewer = document.createElement('div');
  viewer.className = 'story-view';
  viewer.innerHTML = `
    <img id="svImg" alt="Tu resultado">
    <div class="sv-hint" id="svHint">Mantén pulsada la imagen para guardarla y súbela a tu historia 📲<br>¡Etiquétame y pon el link del juego!</div>
    <div class="sv-row">
      <button id="svShare">📤 Compartir</button>
      <button id="svSave">💾 Guardar</button>
      <button class="sv-close" id="svClose">Cerrar</button>
    </div>`;
  function mountV(){ if(document.body) document.body.appendChild(viewer); else setTimeout(mountV, 20); }
  mountV();
  let currentBlob = null, currentUrl = null;
  viewer.querySelector('#svClose').addEventListener('click', () => viewer.classList.remove('show'));
  viewer.querySelector('#svSave').addEventListener('click', () => {
    if(!currentUrl) return;
    const a = document.createElement('a');
    a.href = currentUrl; a.download = 'sebastian-runner-record.png';
    document.body.appendChild(a); a.click(); a.remove();
  });
  viewer.querySelector('#svShare').addEventListener('click', async () => {
    if(!currentBlob) return;
    const file = new File([currentBlob], 'sebastian-runner-record.png', { type: 'image/png' });
    const text = '¡He hecho ' + (lastRun ? lastRun.distance : 0) + ' m en Sebastián Runner! ¿Me superas? ' + GAME_URL;
    try{
      if(navigator.canShare && navigator.canShare({ files: [file] })){
        await navigator.share({ files: [file], text });
      } else if(navigator.share){
        await navigator.share({ title: 'Sebastián Runner', text, url: GAME_URL });
      } else {
        viewer.querySelector('#svSave').click();
      }
    }catch(e){ /* el usuario canceló */ }
  });

  async function shareStory(run){
    run = run || lastRun;
    if(!run) return;
    const blob = await makeStoryImage(run);
    if(!blob) return;
    if(currentUrl) URL.revokeObjectURL(currentUrl);
    currentBlob = blob; currentUrl = URL.createObjectURL(blob);
    viewer.querySelector('#svImg').src = currentUrl;
    viewer.classList.add('show');
  }

  window.__social = { api, renderRanking, afterRun, shareStory, makeStoryImage, gameUrl: GAME_URL };
})();
