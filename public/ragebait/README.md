# public/ragebait/ — Ragebait WebAssembly build

Estos son los artefactos del build web de Ragebait (Emscripten), servidos como
estáticos desde el mismo dominio del portafolio. La página `/ragebait` los carga.

## Archivos necesarios

| Archivo      | Qué es                                  |
| ------------ | --------------------------------------- |
| `index.js`   | Loader de Emscripten                    |
| `index.wasm` | Motor compilado (C++17/SDL2/Lua)        |
| `index.data` | Assets empaquetados (mapas, audio, etc) |

> No copies `index.html` aquí (la página `/ragebait` de Next.js hace de shell).
> Este build **no** usa pthreads, así que **no** hacen falta headers COOP/COEP.

## Cómo actualizar a un build más nuevo

Desde el repo del juego (`Videojuegos/Ragebait/ragebait`):

```bash
source /ruta/a/emsdk/emsdk_env.sh
make web            # genera dist/index.{js,wasm,data}
```

Luego copiá esos 3 archivos aquí, sobrescribiendo los actuales:

```bash
cp dist/index.js dist/index.wasm dist/index.data \
   "<portafolio>/public/ragebait/"
```

Nada más cambia en el portafolio: la integración lee siempre `/ragebait/index.js`.
