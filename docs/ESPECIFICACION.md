# LÀMPARES 101 — Especificación técnica

Versión 0.4 · 23/11/2026 · Planteamiento «explorador de la lámpara» · lámparas 01 y 02

## 1. Qué es

Un taller virtual 3D. El alumno tiene delante su lámpara sobre el banco y **aprende tocándola**: cada pieza
que pulsa sale de la lámpara, se pone de frente y muestra sus cotas y agujeros. El panel lateral explica esa
pieza en cuatro pestañas: **Medidas · Cortar · Preparar · Montar**. Los componentes eléctricos y las
herramientas y materiales del banco también se pueden tocar.

No es una guía punto por punto ni hay lecciones, demostraciones automáticas ni prácticas puntuables.
Sin cuentas y sin guardar nada.

### Al entrar: «Antes de empezar»
1. **Grosor del tablero.** El alumno lo mide con el calibre y lo escribe (2–25 mm). Todas las medidas de las
   piezas se calculan con ese valor.
2. **¿Con qué material cuentas?** Responde «Lo tengo / No» a cada material y herramienta, y elige su
   portalámparas (E27, E14 o ninguno).

Cada ficha cruza lo que hace falta con lo que tiene: si le falta algo, se lo dice en ese paso. Se puede revisar
en cualquier momento desde «Mi material». Al recargar la página se vuelve a preguntar.

## 2. Fuentes de los datos (`../lampara_01`, solo lectura)

| Dato | Fuente |
|---|---|
| Fórmulas de las piezas, agujeros Ø3,5 / avellanado Ø7, corte (kerf 3 mm) | `generador/generar_planos.py` (v1, validada con 10 mm) |
| Secuencia de montaje y tabla de uniones | `generar_planos.py`, `ASSEMBLY` y lámina de uniones |
| Agujero del portalámparas E27 (Ø41), ranura del cable 8 × 15 a 60 mm del lateral derecho | `iteracion_02/generar_propuesta.py`, revisión B (**provisional**) |
| Kit eléctrico (geometría y cotas) | Iteración 2, revisión B (**provisional**) |
| Materiales | Presupuestos de octubre y noviembre (`materiales_lamparas.md`) + planos v1. Sin verificar. |

`tools/check-model.mjs` comprueba que el modelo paramétrico con T = 10 coincide con el GLB convertido del CAD
(las 12 piezas, centro y tamaño).

**No se inventan medidas.** Con un grosor distinto de 10 mm, las medidas se recalculan con las mismas fórmulas
y la app pide que el profesor las revise antes de cortar. Con portalámparas E14, el agujero no tiene medida
documentada: la app indica cómo medirlo (rosca + 1 mm de holgura, regla de la propuesta) y que lo confirme el profesor.
Si el alumno no tiene tornillos pero sí clavos, la app lo avisa y remite al profesor.

## 3. Arquitectura

```
src/content/lamps/lampara_01.model.ts   buildPieces(T, portalámparas) + ASSEMBLY (fórmulas del generador)
src/content/lamps/lampara_01.ts         manifiesto: componentes, catálogo, documentos, avisos
src/content/index.ts                    registro de lámparas
src/state/store.ts                      inventario, selección, pestañas (zustand)
src/three/Lamp.tsx                      piezas como cajas paramétricas + kit eléctrico
src/three/PieceDetail.tsx               ficha 3D: la pieza sale, gira, cotas y agujeros; «Ver dónde encaja»
src/three/props/                        materiales y herramientas del banco (clicables)
src/ui/Inventory.tsx                    «Antes de empezar»
src/ui/Sidebar.tsx                      índice: piezas, parte eléctrica, banco, «Mi material»
src/ui/InfoPanel.tsx                    fichas de pieza, componente y objeto; esquema; planos
```

Añadir una lámpara: su `*.model.ts` con `buildPieces` y `ASSEMBLY`, su manifiesto y una línea en
`content/index.ts`. El GLB (`tools/build-assets.mjs`) sigue sirviendo de referencia y de comprobación.

## 4. Movimiento
Solo transiciones cortas (< 1 s) que provoca el alumno: la pieza sale y vuelve, «Ver dónde encaja», separar
piezas, cámara. Se desactivan con «reducir movimiento». Las animaciones de operaciones (cortar, encolar) se
añadirán solo si hacen falta.

## 5. Seguridad eléctrica
Kit de 230 V montado de fábrica: enchufe → clavija → cable → interruptor de paso → portalámparas → bombilla.
La app explica qué hace y dónde va cada componente, sin instrucciones de conexión. La colocación y la
comprobación las hace personal cualificado.

## 6. Pendiente
- Medir el material recibido (tablero, portalámparas, cable, interruptor) y cerrar la iteración 2 del CAD
  (afecta también al agujero Ø41 y a la ranura de `lampara_02`).
- Decidir la unión con clavos o tornillos y, si cambia, actualizar `ASSEMBLY`.
- Fondo atornillado de la propuesta de la iteración 2 (pieza 8): no incluido hasta que se confirme.
- `lampara_03`.

## 7. Idioma y fotos (22/11/2026)
- Toda la interfaz y los contenidos están en **catalán**.
- En «Quin material tens?» cada objeto tiene un botón **?** que abre una foto real del objeto. Las mismas fotos
  aparecen en las fichas de herramientas, materiales y componentes.
- Fotos: Wikimedia Commons, licencias libres (dominio público, CC0, CC BY, CC BY-SA). Copias en
  `public/img/material/`; autor, licencia y enlace en `src/content/photos.json` y bajo cada foto.
- Falta foto del **cable tèxtil**: no se encontró ninguna adecuada; la app lo indica.

## 8. Lámpara 02 (23/11/2026)
Columna en L con la luz escondida (`../lampara_02`, VERSIÓN 1, medidas de madera validadas el 22/11/2026).

- Selector **L01 / L02** arriba del índice. Al cambiar, si la lámpara nueva tiene material que el alumno aún no ha
  contestado (contrachapado de 5 mm, barniz, fieltros, abrazadera, sierra de marquetería), se le pregunta solo eso.
- `src/content/lamps/lampara_02.model.ts` copia las fórmulas de `generar_planos_02.py`: `G()`, `wood_items()`,
  `screws()` (41 tornillos), `piece_holes()` y `cable_path()`. 19 piezas (9 de contrachapado, 10 listones) y 10 pasos.
- Los agujeros llevan la **misma letra que la tabla de la lámina** y se enseña la **misma cara** (desde detrás para la
  trasera, desde fuera para los laterales); las piezas que la lámina dibuja tumbadas se enseñan de pie. El avellanado
  por la cara oculta se dibuja más tenue y la ficha «Preparar» dice qué agujeros se avellanan por cada cara.
- Con otro grosor cambian también medidas generales (la base mide 215 + 2T de fondo): se recalculan con las mismas
  fórmulas y la app pide revisión del profesor.
- El fondo 5 (contrachapado de 5 mm) es la tapa de registro de la parte eléctrica: **solo con tornillos**, sin cola;
  la app no propone clavos para ese paso.
- Comprobación: `tools/check-model.mjs` compara con un volcado del generador (`tools/ref/lampara_02.json`, T = 10, 9,5
  y 12: cajas, medidas de corte, agujeros y su orden, tornillos, recorrido del cable) y con `lampara_02.obj`.

### Cambios comunes
- Tipos del modelo en `src/content/model.ts`; cada lámpara aporta `place(T)` (portalámparas, cable, abrazadera).
- Las etiquetas 3D ya no usan `<Html>` de drei (una raíz de React por etiqueta, fallaba al cambiar de lámpara):
  `src/three/ScreenHtml.tsx` las dibuja todas en una capa HTML encima del lienzo. Desaparece también el aviso de desarrollo.
