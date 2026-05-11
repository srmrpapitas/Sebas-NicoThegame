# 🌋 Sebastián Runner

> **Build actual:** `2026.05.11-o` · Juego web 3D escrito en un único `index.html` con Three.js + WebRTC.

Aventura en Tenerife. Corre por la playa esquivando cangrejos, prueba suerte en el casino, explora el mundo abierto y sube *skills* al estilo RuneScape — todo desde el navegador, sin instalación.

**🎮 Jugar online:** [sebas-nicothegame.pages.dev](https://sebas-nicothegame.pages.dev)

---

## 🎯 Modos de juego

| Modo | Qué hay |
|---|---|
| 🎮 **Jugar** | Endless runner clásico. Tres carriles, cangrejos, rocas, sombrillas. Recoge tickets para puntuar. |
| 🎰 **Casino Sebas** | Ruleta y dados. Apuesta tickets para ganar ✨ oro. |
| 🌴 **Sandbox** | Mundo abierto de Tenerife: Teide, océano, palmeras, edificios y NPCs. Multiplayer en tiempo real. |
| 🏆 **Ranking** | Top 10 local de distancia y puntuación. |
| 👤 **Avatar** | 4 personajes: tú, Sebastián, Nico y Leo. |

---

## 🌴 Qué hay dentro del Sandbox

- **Mundo abierto** con suelo, océano, volcán Teide, palmeras y 6 edificios
- **🏦 Banco GP** — depósito/retirada de tickets y ✨ oro. La caja fuerte sobrevive a la muerte; el bolsillo no.
- **🚗 Coche** conducible (tecla `E` para entrar/salir)
- **7 NPCs civiles** que pasean por la plaza
- **👹 Demonios Mipo** (zona suroeste) — primer enemigo del skill *Cazademonios*
- **🤼 Modo lucha + 👊 puñetazos** con sistema de daños al estilo RuneScape (rolls, hitsplats, contraataques)
- **Panel de combate persistente** (lado derecho, estilo RS) con:
  - Arma equipada + Nivel de combate
  - Estilos: 👊 Ataque · 💪 Fuerza · 🛡️ Defensa
  - Toggle de auto-ataque
  - Hueco de ataque especial (aparece al equipar un arma con special)
- **🌐 Multiplayer P2P** vía PeerJS — los demás jugadores aparecen como cápsulas con su nombre flotando

---

## 📈 Sistema de skills (RuneScape-style)

XP curve idéntica a RuneScape — nivel 99 son 13.034.431 xp.

**Combate:**
⚔️ Ataque · 💪 Fuerza · 🛡️ Defensa · ❤️ Vida · 👹 Cazademonios

**No combate (próximas minijuegos):**
⛏️ Minería · 🔥 Cocina · 🎣 Pesca · 🏃 Agilidad

XP toast al ganar XP, banner *"¡Nivel N de X!"* al subir de nivel.

---

## ⚔️ Combate

- **Cada NPC** tiene su propio nivel de combate (civiles 2–6, Mipos 1–2) y HP
- **Daños RuneScape-flavored** — tu Ataque vs su Defensa, max-hit basado en Fuerza + estilo
- **Hitsplats** — número rojo = daño, "0" azul = fallo
- **NPCs contraatacan** cada 2,4 s mientras estés en modo lucha y a melee range
- **Al morir** pierdes TODO el bolsillo (tickets + oro). La caja del banco queda intacta — respawneas en el origen con vida llena.

---

## 🚀 Cómo desplegar

```
1. Sustituye index.html en el repo srmrpapitas/Sebas-NicoThegame
2. Push a main
3. Espera 1-2 min al deploy de Cloudflare Pages / GitHub Pages
4. Verifica abajo a la izquierda del menú — debe decir build 2026.05.11-o
```

Si la versión sigue siendo la antigua, el deploy aún no ha pasado o el navegador tiene caché (Ctrl+Shift+R / Cmd+Shift+R).

---

## 📁 Estructura del proyecto

```
index.html             ← El juego entero (~290 KB)
reassemble.py          ← Reconstruye una versión monolítica desde chunks .b64
assets/
  AVATAR_GLB_B64.b64   ← Avatar del jugador
  GLB_SEBASTIAN_B64.b64
  GLB_NICO_B64.b64
  LEO_GLB_B64.b64
  AUDIO_LAUGH_B64.b64
  AUDIO_BG_B64.b64     ← Música de fondo (actualmente desactivada)
  walk.fbx             ← Animación de caminar (Mixamo)
  capoeira.fbx         ← Animación de pelea/golpe
  defeated.fbx         ← Animación de KO
```

Tamaño total de assets: ~31 MB. El HTML monolítico: ~290 KB.

---

## 💾 Persistencia

Todo se guarda en `localStorage`:

| Clave | Contenido |
|---|---|
| `sebRunnerTickets` | Tickets en el bolsillo |
| `sebRunnerGold` | ✨ oro en el bolsillo |
| `sebRunnerVault_v1` | Contenido de la caja del banco `{tickets, gold}` |
| `sebRunnerStats_v1` | XP de skills + estilo de combate |
| `sebRunnerName` | Tu nombre en el sandbox y en el ranking |
| `sebRunnerAvatar` | Avatar elegido |
| `sebRunnerRanking_v1` | Top 10 local |
| `sebRunnerAutoAttack` | Estado del toggle de auto-ataque |

---

## 🔧 API pública para testing

Abre la consola del navegador y prueba:

```js
// Darte items
bank.tickets = 100; bank.save();
bank.gold    = 50;  bank.save();

// Darte XP
window.__stats.addXp('strength',  50000);   // sube Fuerza
window.__stats.addXp('slayer',    10000);   // sube Cazademonios
window.__stats.addXp('hitpoints',  5000);   // sube Vida (y max HP)

// Cambiar nombre
window.__setPlayerName('NuevoNombre');

// Ver caja del banco
window.__vault.tickets
window.__vault.gold

// Refrescar el panel de combate (tras equipar/desequipar arma)
window.__refreshCombatRail();
```

---

## 🆕 Cambios recientes

### `2026.05.11-o`
- 🐛 **Bugfix crítico:** declarada la constante `SANDBOX_UNLOCK_GOLD` que faltaba — el sandbox dejaba de cargar en pantalla "Cargando Tenerife…". Valor actual: `0` (sandbox abierto desde el principio). Sube este número en `index.html` para gatear el sandbox tras X ✨ oro.
- ⚡ Hueco de **ataque especial** colocado debajo del toggle de auto-ataque (sigue oculto hasta que haya equipo).

### `2026.05.11-n`
- ⚔️ **Panel de combate persistente** estilo RuneScape en el lado derecho del sandbox — visible siempre durante el juego (en pantallas ≥ 760 px). Arma equipada, nivel de combate, tres estilos (Ataque/Fuerza/Defensa), toggle de auto-ataque.
- 🤖 **Auto-ataque** — encendido lanza `doPunch()` cada 2,4 s mientras estés en 🤼 modo lucha.

### `2026.05.11-m` (HANDOFF original)
- 🏦 Banco GP funcional con caja fuerte
- 👹 Demon Slayer (Mipo placeholder) en la esquina suroeste
- 📜 Modal de Estadísticas/Mochila/Combate
- 🌐 Multiplayer PeerJS

---

## 🚧 Roadmap

1. **Optimizar y enchufar el GLB real de Mipo** — el FBX actual pesa 52 MB con textura 4K, demasiado pesado. Convertir a GLB con Draco (~2-4 MB) y textura 1024² antes de subirlo.
2. **Demás razas de demonios** — Yokai (lv 3-5), Oni (lv 6-10), Kappa (lv 11-15), Tengu (lv 16-20)
3. **Sistema de equipo** — slots de cabeza/torso/manos/pies/arma con stats que suman a daño/defensa, y armas con ataque especial (revelan el hueco ⚡ del panel)
4. **Mochila funcional** — drops de demonios (huesos, colmillos, pergaminos), comida que cura HP
5. **Minijuegos de skills**:
   - 🎣 **Pesca** en el anillo oceánico
   - ⛏️ **Minería** en rocas cerca del Teide
   - 🔥 **Cocina** en hoguera
6. **Misiones** cortas con recompensa de XP/items
7. **Visualización de death drop** — pila de items en el suelo al morir
8. **NPCs hablables** para pistas y misiones

---

## 🛠️ Stack técnico

- **Three.js** para 3D (loader GLB + FBX)
- **WebRTC + PeerJS** para multiplayer P2P (broker público gratis, sin servidor propio)
- **Vanilla JS** — sin frameworks, todo en un único `index.html`
- **localStorage** para persistencia
- **Assets en base64** dentro de `assets/*.b64`, montados en `window` al boot

---

## 📜 Licencia

MIT — Ver `LICENSE`.

---

> Hecho con ☀️ en Tenerife.
