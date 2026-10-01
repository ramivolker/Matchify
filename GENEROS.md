# Género y preferencias de género

Implementado y aplicado en la base local. No se ejecutó reset ni se eliminaron datos existentes.

## Modelo final

Fragmentos agregados al schema; el resto de los campos se conserva:

```prisma
enum Genero {
  MASCULINO
  FEMENINO
  NO_BINARIO
  OTRO
}

// En Usuario:
// genero Genero?

// En Preferencia:
// generos PreferenciaGenero[]

model PreferenciaGenero {
  preferenciaId Int
  genero       Genero
  preferencia  Preferencia @relation(fields: [preferenciaId], references: [id], onDelete: Cascade)

  @@id([preferenciaId, genero])
}
```

`Usuario.genero` permite null permanentemente y no tiene default: los usuarios existentes conservan su identidad sin asignaciones inventadas. La clave compuesta impide duplicados; las escrituras de preferencias reemplazan las asociaciones mediante una operación anidada y atómica de Prisma. El mínimo de una asociación se exige en la API, no mediante un constraint SQL.

Migración generada con `prisma migrate diff`: [20261001190000_agregar_generos/migration.sql](backend/prisma/migrations/20261001190000_agregar_generos/migration.sql). Solo agrega una columna nullable y una tabla con su clave foránea. Fue aplicada con `prisma migrate deploy`.

## API y candidatos

- `POST /api/usuarios` y `PUT /api/usuarios/:id` aceptan `genero` con un valor del enum o null. Omitirlo en PUT conserva su valor. Se mantienen los campos obligatorios actuales del CRUD.
- Las lecturas de usuario devuelven `genero`.
- `POST/PUT /api/usuarios/:usuarioId/preferencia` requieren `generos`: array no vacío, sin duplicados y con valores del enum. Los errores usan `ValidationError` y HTTP 400. Distancia y edades mantienen sus validaciones.
- `GET/POST/PUT` de preferencias devuelven `generos` como strings, por ejemplo:

```json
{
  "id": 1,
  "usuarioId": 6,
  "distanciaMaxKm": 50,
  "edadMinima": 20,
  "edadMaxima": 30,
  "generos": ["FEMENINO", "NO_BINARIO"]
}
```

- Las preferencias heredadas sin asociaciones se leen como `generos: []`. La UI pide elegir al menos uno; candidatos responde 400 con la indicación de configurarlos. No se asigna una selección implícita.
- `GET /api/usuarios/:usuarioId/candidatos` agrega `genero: { in: generos }` a la consulta existente. Conserva exclusión del propio usuario, actividad, interacciones previas, bloqueos en ambas direcciones, ubicación, edad y distancia. Los candidatos con null nunca coinciden, incluso con los cuatro géneros seleccionados. La respuesta también incluye el género del candidato.

## Interfaz y seed

Editar Perfil carga, guarda y vuelve a mostrar el género actual; «Sin especificar» representa null. Descartar restaura el género guardado al reabrir el editor.

Preferencias de búsqueda incorpora cuatro chips después de edad y antes de las acciones. Usan el accent rosa, check y `aria-pressed`. «Todos» selecciona los cuatro valores reales. Guardar requiere al menos uno. La comparación del estado pendiente considera conjuntos, independientemente del orden; Cancelar restaura el baseline y Guardar lo actualiza. Se contemplan preferencias nuevas y heredadas.

El seed declara género y selección explícitos para sus 18 perfiles ficticios `@seed.matchify.test`, con los cuatro géneros y selecciones variadas. Se mantienen los upserts, sin lógica por ID, nombre o avatar. Se ejecutó dos veces y se comprobó idempotencia y conservación de usuarios reales, sus preferencias, interacciones, matches y bloqueos.

## Archivos del cambio

- `backend/prisma/schema.prisma`, `backend/prisma/seed.js` y la nueva migración.
- `backend/src/validators/genero.validator.js`, `usuario.validator.js`, `preferencia.validator.js`.
- `backend/src/repositories/preferencia.repository.js`, `candidato.repository.js`.
- `backend/src/services/preferencia.service.js`, `candidato.service.js`.
- `frontend/src/components/TinderView/MiPerfilTab.jsx`, `PreferenciasSection.jsx`.
- `frontend/src/utils/generoUtils.js`, `frontend/src/services/api.js`, `frontend/src/App.css`.
- `backend/test/preferencias-candidatos.test.js`, `usuario-biografia.test.js`, `genero-ui.test.js`, `generos-db.test.js`.
- `frontend/dist/index.html` y assets generados por el build (assets ignorados por Git).
- Este documento. Los cambios previos de `backend/package.json` no pertenecen a esta implementación.

## Verificaciones y comandos

Ejecutados: `prisma validate`, `prisma generate`, `prisma migrate deploy`, `prisma migrate status` y build de Vite, todos correctos. La base quedó actualizada y `/api/health` respondió OK después de reiniciar el backend para liberar la DLL de Prisma en Windows.

Pasaron 16 pruebas automáticas de API/componentes y una prueba opt-in contra MySQL que ejecuta el seed dos veces. Las pruebas HTTP sustituyen Prisma; las de UI ejecutan componentes y handlers con hooks controlados, sin navegador. No se realizó una inspección visual ni una prueba de interacción con DOM real. El bundler de tests informa una clave `getCandidatos` duplicada preexistente en `api.js`.

No quedan comandos obligatorios para esta base local. Para reproducir en otra instalación, desde `backend` y con el servidor detenido durante `generate`:

```powershell
npx prisma validate
npx prisma migrate status
# Revisar las migraciones pendientes antes de deploy.
npx prisma migrate deploy
npx prisma generate
npm run seed
node --test test/*.test.js
```

La prueba de base es opt-in y vuelve a sincronizar los perfiles ficticios:

```powershell
$env:RUN_DB_TESTS = '1'
node --test test/generos-db.test.js
Remove-Item Env:RUN_DB_TESTS
```

Desde la raíz: `npm --prefix frontend run build`. Reiniciar el backend después de aplicar el cambio en otra instalación.

No se realizó commit ni push.
