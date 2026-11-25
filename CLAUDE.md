# CLAUDE.md — rel-enc

Capa de aplicación Backend-Plus (npm) "relativo a encuestas": sobre `operativos`, agrega al cliente la estructura de los formularios (`form-structure`), el validador de filas (`row-validator`), sus estilos e imágenes. Lo usa `meta-enc` y, a través de él, `dmencu`, así que un cambio de comportamiento puede romper a los que dependen de él.

---

## Estructura de archivos

- `src/server/`: `rel-enc.ts` (punto de entrada, `emergeAppRelEnc` y `AppRelEnc`), `types-rel-enc.ts`, `server-rel-enc.ts`.
- `src/client/`: `form-structure.ts` (estructura y despliegue de formularios), `css/` (stylus) e `img/`.
- `src/tests/`: tests con Mocha.
- `dist/` (build) y `compile-for-test/` (tests compilados) se generan; no se versionan.

---

## Convenciones de código

- **Todos los tipos deben ser explícitos**. Prohibido usar `any` nuevo, casts vía `unknown`, o cualquier magia sin justificación. (Hay `any` heredados: no agregar más.)
  - En un `catch`, la variable es `unknown`: usar `(err as Error).message`.
- **Preservar el estilo existente** al modificar archivos: incluyendo el uso de `var` y los comentarios en inglés donde ya están.
- **No tocar el formato de lo que ya existe**: el diff de un cambio debe mostrar sólo las líneas que cambian de verdad.
  - No reindentar, no reformatear, no quitar ni agregar espacios al final de las líneas, y no agregar ni quitar el salto de línea final del archivo.
  - Respetar el fin de línea de cada archivo: hay archivos con CRLF y otros con LF. Las líneas nuevas van con el mismo fin de línea que el resto del archivo. Revisar con `git ls-files --eol <archivo>`.
  - En Windows no editar con `sed -i` ni herramientas que reescriban el archivo completo, porque pueden convertir CRLF a LF.
  - Antes de commitear, revisar `git diff --stat` contra `git diff --ignore-all-space --ignore-cr-at-eol --stat`. Si dan distinto, hay cambios de formato que hay que revertir.
- **Nunca repetir código**: antes de escribir una función o constante, buscar si ya existe y reutilizarla.
- Los nombres de tablas, columnas y variables de dominio van **en castellano**. Comentarios nuevos y mensajes, en castellano.

---

## Compilación

- **Compilación sin fallbacks**: los tests no toleran errores de TypeScript y no hay que agregar `|| echo "continue w/error"` a ningún script nuevo. Un error de compilación se corrige en el código.
- **Deuda conocida: el build todavía tiene `|| echo "continue w/error"`** y por eso publica aunque haya errores de TypeScript (en el cliente y, según el paquete, en el servidor). No agregar más errores. El objetivo es corregirlos y sacar el fallback; mientras tanto, antes de commitear, correr `npx tsc -p src/server` y `npx tsc -p src/client` y verificar que la cantidad de errores no aumentó.
- `npm run build` compila `src/server` y `src/client` a `dist/` y después corre `mixin-patch`.
- Si `mixin-patch` se cuelga sin salida, casi seguro hay un `.d.ts` viejo en `dist/` que dispara su regex (catastrophic backtracking). Solución: borrar `dist/` y volver a compilar.
- `npm install` / `npm ci` corren `prepare`, que hace el build.
- `package-lock.json` **se versiona**: el workflow de publicación usa `npm ci`. Si se cambian dependencias, commitear el lock actualizado.
- Con `NODE_ENV=production` npm no instala las devDependencies (TypeScript, Mocha, `types.d.ts`) y el build falla: instalar con `--include=dev`.

---

## Casos de prueba

- **Framework**: Mocha. **Comando**: `npm test` (compila `src/tests` a `compile-for-test/` y corre los tests).
- Los tests actuales no usan base de datos: prueban que la aplicación se arma sobre `operativos` y qué módulos agrega al cliente. Lo que sirve archivos (`addLoggedServices`) necesita el servidor levantado.
- Todo cambio de comportamiento lleva sus tests, salvo que dependa de la base de datos. Antes de corregir un error, escribir el test que lo reproduce y verificar que falla.
- Antes de commitear: `npm run build` y `npm test` tienen que pasar sin errores.

---

## Documentación

Mantener actualizado el `README.md` cuando se agreguen o cambien funcionalidades.

---

## Publicación

- `rel-enc` se publica en npm **sólo desde GitHub Actions** (`.github/workflows/publish.yml`, que usa el reusable `npm-publish-new-version.yaml@v3` de `codenautas/.github`). No hacer `npm publish` local.
- Para publicar: `npm version patch` (o `minor`/`major`), que sube `package.json`, hace el commit y crea el tag `vX.Y.Z`; después `git push --follow-tags`. El push del tag dispara el workflow.
- Un tag por versión. No crear ni pushear el tag antes de subir la versión en `package.json`. El workflow exige que el tag sea `v<versión de package.json>`.
- Alternativa: subir la versión sin tag, pushear a `master` y correr a mano **Actions → Publish → Run workflow**; en ese caso el workflow crea el tag.
- Requiere **Trusted publisher** configurado en npmjs.com para el paquete: organización `codenautas`, repositorio `rel-enc`, workflow `publish.yml`, sin environment, publicando directamente. Sin eso `npm publish` falla con 404.
- Versiones con `beta`, `alpha` o `rc` se publican con ese dist-tag y no con `latest`.
- npm no permite republicar una versión: si falló después de publicar, subir la versión.
- Después de publicar, actualizar los que dependen de `rel-enc` (`meta-enc` y, a través de él, `dmencu` y las apps) si el cambio tiene que llegarles.
