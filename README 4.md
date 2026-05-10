# 🌋 Sebastián Runner — Aventura en Tenerife 3D

Endless runner 3D ambientado en Tenerife, hecho en **Three.js** y empaquetado en **un solo archivo HTML** (todo embebido, sin build, sin dependencias que instalar).

![Tenerife](https://img.shields.io/badge/zona-Tenerife-orange)
![Three.js](https://img.shields.io/badge/Three.js-r158-blue)
![Single file](https://img.shields.io/badge/single--file-HTML-green)

## ✨ Qué incluye

- **5 zonas temáticas** que se alternan cada ~280–320 m con crossfade suave: Playa del Duque, Volcán Teide, Pueblo Canario, Bosque de Laurisilva y Acantilado.
- **17+ obstáculos** (cangrejos, lagartos veloces, sombrillas, tablas de surf, turistas con palo selfie, bombas volcánicas con telegraph, ramas de drago que caen, gallos, helechos, fumarolas…).
- **Diálogos cinemáticos estilo Final Fantasy** con retratos 3D animados.
- **Sistema de avatares** intercambiables.
- **Modificadores ambientales** por zona: viento que empuja en el acantilado, niebla densa en la laurisilva, oscuridad temporal por sombras de avión, partículas de ceniza en el Teide, espuma marina en los acantilados.
- **Música y voz embebidas** en base64 (Papá / la risa de Sebastián).

## 🚀 Cómo probarlo

### Opción 1 — Doble click
Abre `sebastian_runner.html` en cualquier navegador moderno (Chrome, Safari, Firefox, Edge). No necesita servidor.

### Opción 2 — Servir localmente (recomendado en algunos navegadores estrictos)
```bash
python3 -m http.server 8080
# después abre http://localhost:8080/sebastian_runner.html
```

### Opción 3 — GitHub Pages (publicar online)
1. Sube el repo a GitHub.
2. Ve a *Settings → Pages*.
3. Source: `main` (o tu rama), folder: `/ (root)`.
4. Guarda. En unos segundos tendrás una URL pública del estilo `https://tu-usuario.github.io/sebastian-runner/sebastian_runner.html`.

> 💡 Para que la URL sea más limpia puedes renombrar el archivo a `index.html`.

## 🎮 Controles

| Acción | Teclado | Móvil |
|---|---|---|
| Cambiar carril | ◀ ▶ / A D | swipe horizontal o botones laterales |
| Saltar | ↑ / W / Espacio | swipe arriba / botón naranja |
| Pausa | P / Esc | botón ⏸ |

## 🔧 Cómo personalizar los assets

El HTML tiene **placeholders** marcados claramente al inicio del primer `<script>`:

```js
window.SEB_PHOTO_B64       = "__PLACEHOLDER_SEB_PHOTO_B64__";
window.AVATAR_GLB_B64      = "__PLACEHOLDER_AVATAR_GLB_B64__";
window.GLB_SEBASTIAN_B64   = "__PLACEHOLDER_GLB_SEBASTIAN_B64__";
window.GLB_NICO_B64        = "__PLACEHOLDER_GLB_NICO_B64__";
window.AUDIO_BG_B64        = "<<embebido: música de fondo>>";
window.AUDIO_LAUGH_B64     = "<<embebido: risa del popup>>";
```

Si alguno está sin rellenar, el juego **funciona igualmente** con personajes procedurales de respaldo (un *guard* al cargar neutraliza los placeholders pendientes).

### Para sustituir un placeholder

```bash
# Convertir tu archivo a base64 (una sola línea, sin saltos)
base64 -w 0 tu_modelo.glb > sebastian.b64

# Después abre sebastian_runner.html y sustituye el string entre comillas
# de window.GLB_SEBASTIAN_B64 por el contenido de sebastian.b64
```

Formatos esperados:
- `SEB_PHOTO_B64`: JPEG (foto de Sebastián para el popup)
- `AVATAR_GLB_B64`, `GLB_SEBASTIAN_B64`, `GLB_NICO_B64`: GLB (formato glTF binario)
- `AUDIO_*_B64`: M4A / AAC

## 🗂️ Estructura del repo

```
.
├── sebastian_runner.html   ← el juego completo en un archivo
├── README.md
├── LICENSE
└── .gitignore
```

## 🤝 Créditos

- Diseño y dirección: Sebastián
- Música y voz: archivos `Papa.m4a` y `Papa_es_gracioso_.m4a` embebidos en base64
- Three.js r158 cargado vía CDN (`unpkg.com`)

## 📜 Licencia

MIT — ver [LICENSE](./LICENSE).
