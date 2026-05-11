# Sebastián Runner — versión "lean"

## Qué es esto

El archivo original `index.html` pesaba **8.7 MB** porque tenía 5 modelos 3D
(`.glb`) y dos audios (`.m4a`) embebidos como strings base64 dentro del HTML.
Eso hace casi imposible editar el código: cualquier editor se atasca y no se
puede pasar el archivo por contexto a un asistente.

Esta versión "lean" separa los assets del código:

```
sebastian-runner/
├── index.html          ~150 KB   código del juego (editable)
├── assets/
│   ├── AVATAR_GLB_B64.b64        \
│   ├── GLB_SEBASTIAN_B64.b64     |  base64 sin decodificar
│   ├── GLB_NICO_B64.b64          |  (lo que carga el HTML)
│   ├── LEO_GLB_B64.b64           |
│   ├── AUDIO_BG_B64.b64          |
│   ├── AUDIO_LAUGH_B64.b64       /
│   │
│   ├── *.glb / *.m4a             versiones binarias decodificadas
│   │                              (por si las quieres abrir en Blender,
│   │                               reproducir, etc.)
│   │
│   └── GLB_NICO_B64.old.{b64,glb}   Nico anterior (sin animación de correr)
│
├── reassemble.py       script para volver al HTML monolítico si hace falta
└── README.md           este archivo
```

## Avatares disponibles

| Avatar | GLB | Animación |
|--------|-----|-----------|
| Tú | `AVATAR_GLB_B64.glb` | Clip de carrera clonado de Leo |
| Sebastián | `GLB_SEBASTIAN_B64.glb` | Clip de carrera clonado de Leo |
| Nico | `GLB_NICO_B64.glb` (nuevo, reemplaza al viejo) | Propia (Mixamo run) |
| Leo | `LEO_GLB_B64.glb` (nuevo) | Propia (Mixamo run) |

Todos los modelos comparten el rig estándar Mixamo de 52 huesos, lo que
permite que la animación de correr (`mixamo.com`) se reproduzca en
cualquiera vía `THREE.AnimationMixer` sin retargeting.

## Cómo ejecutarlo

El HTML carga los assets con `fetch()`, así que **no funciona abriendo el
archivo directamente** (`file://` está bloqueado por el navegador para
fetch). Necesitas un servidor HTTP local. La forma más simple:

```bash
cd sebastian-runner
python3 -m http.server 8000
```

Y abre <http://localhost:8000/> en el navegador.

Alternativas equivalentes: `npx serve`, `php -S 0.0.0.0:8000`, la extensión
"Live Server" de VS Code, etc.

## Qué cambió en el HTML

Solo dos cosas, ambas alrededor de la línea 1095:

1. Las 5 líneas gigantes `window.X_B64 = "...base64..."` se sustituyeron por
   comentarios placeholder.
2. Se inyectó un pequeño loader async que hace `fetch('assets/X.b64')` para
   cada uno de los 5 nombres y los expone en `window[X]`, igual que antes.
3. El bloque `<script type="module">` que ejecuta el juego empieza con
   `await window.__assetsReady;` para esperar a que esos fetch terminen.

El resto del archivo (3700+ líneas de lógica del juego) está intacto.

## Volver al archivo único

Si en algún momento necesitas el HTML monolítico otra vez (para subirlo a
un host estático que no permita servir carpetas, por ejemplo):

```bash
python3 reassemble.py
```

Genera `index.monolithic.html` con todo embebido de nuevo.
