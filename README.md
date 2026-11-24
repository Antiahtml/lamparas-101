# Làmpares 101

Taller virtual 3D para fabricar las lámparas de sobremesa de madera (Tecnología): `lampara_01` y `lampara_02`.
React + TypeScript + Three.js + React Three Fiber + Drei + GSAP + Tailwind.

Especificación técnica y plan por fases: [docs/ESPECIFICACION.md](docs/ESPECIFICACION.md).

## Uso
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # carpeta dist/ estática: se puede subir a cualquier servidor web
npm run assets     # regenera GLB y copia planos desde ../lampara_01 y ../lampara_02 (no modifica los originales)
node tools/check.mjs http://localhost:5173/ ./capturas   # prueba de humo en Chrome headless
```

`node_modules` es un enlace a `node_modules.nosync` para que iCloud no sincronice las dependencias.

## Cómo funciona
Al entrar, el alumno mide el grosor de su tablero y marca el material que tiene. Después explora la lámpara 3D:
cada pieza que toca sale, muestra sus cotas y explica cómo cortarla, prepararla y montarla. Ver `docs/ESPECIFICACION.md`.

```bash
node tools/check-model.mjs   # los modelos paramétricos coinciden con el CAD (L01: GLB; L02: generador con T = 10/9,5/12 y OBJ)
```

## Añadir una lámpara
1. Crear `src/content/lamps/lampara_0X.model.ts` con `buildPieces(T, portalámparas)`, la secuencia de montaje y
   `placeElectric(T)` (tipos en `src/content/model.ts`), y `lampara_0X.ts` (manifiesto: catálogo, componentes, planos).
2. Registrarla en `src/content/index.ts` y marcarla `ready` en `lampList`.
3. Añadir su OBJ y sus planos a `tools/build-assets.mjs` y una comprobación en `tools/check-model.mjs`.
   Para `lampara_02` la referencia es un volcado del generador: `tools/ref/dump_lampara_02.py` → `tools/ref/lampara_02.json`
   (necesita Python con shapely, ezdxf y reportlab; solo lee el generador).
4. Fotos de objetos nuevos del catálogo: `public/img/material/` + créditos en `src/content/photos.json`.
