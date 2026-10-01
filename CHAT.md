# Mensajería persistente de Matchify

Un Match existente representa una conversación. Los mensajes se guardan en MySQL; no se agregó otro modelo de conversación ni Socket.IO.

## Schema y migración

```prisma
model Mensaje {
  id        Int      @id @default(autoincrement())
  matchId   Int
  emisorId  Int
  contenido String   @db.VarChar(1000)
  enviadoEn DateTime @default(now())
  leido     Boolean  @default(false)

  match  Match   @relation(fields: [matchId], references: [id], onDelete: Cascade)
  emisor Usuario @relation(fields: [emisorId], references: [id], onDelete: Cascade)

  @@index([matchId, enviadoEn])
}
```

`Usuario` y `Match` incorporan `mensajes Mensaje[]`.

Migración: `backend/prisma/migrations/20261001210000_agregar_mensajes/migration.sql`, generada mediante `prisma migrate diff`. Solo crea Mensaje, su índice y dos claves foráneas. Fue aplicada a la base local, sin resetear ni modificar matches/interacciones existentes. Desactivar un match conserva sus mensajes; borrar un match o usuario explícitamente elimina los mensajes dependientes por cascade.

## Endpoints

| Método y ruta | Comportamiento |
| --- | --- |
| `GET /api/matches/:matchId/mensajes?usuarioId=6` | Historial completo por `enviadoEn ASC, id ASC`. Sin mensajes devuelve `[]`. No modifica lecturas. |
| `POST /api/matches/:matchId/mensajes` | Body `{ "emisorId": 6, "contenido": "Hola" }`. Responde 201 con la fila persistida. |
| `PATCH /api/matches/:matchId/mensajes/leidos` | Body `{ "usuarioId": 6, "hastaMensajeId": 42 }`. Marca solo mensajes recibidos de ese match hasta el ID cargado y devuelve `{ "count": n }`. |
| `GET /api/matches/:usuarioId` | Endpoint existente ampliado: conserva campos anteriores y agrega `otroUsuario`, `ultimoMensaje` (objeto o null) y `noLeidos` (solo recibidos). |

La fecha/hora del último mensaje está en `ultimoMensaje.enviadoEn`. El listado ordena primero conversaciones con mensajes por fecha del último mensaje descendente y luego matches sin mensajes por fecha de creación descendente.

Los IDs deben ser enteros positivos. El contenido debe ser texto no vacío después de trim y tener como máximo 1000 caracteres; se persiste recortado. No se aceptan campos extra al crear mensajes.

Las operaciones comprueban que existen el match y el usuario, que el usuario es participante, que no hay bloqueo en ninguna dirección y que el match está activo. Devuelven 404 para inexistentes, 403 para ajenos/bloqueos y 400 para validación o match inactivo. La comprobación y operación se ejecutan en una transacción Serializable.

Se conserva la semántica actual: bloquear desactiva el match; desbloquear no lo reactiva. El chat no permite leer, escribir ni marcar lecturas en matches inactivos o bloqueados. El historial permanece almacenado.

Todavía no hay autenticación: el controller recibe la identidad elegida desde query/body. El service verifica existencia y pertenencia, pero no acredita la identidad de quien realiza la petición. Cuando se incorpore autenticación, ese ID debe salir del contexto autenticado.

## Frontend

- App conserva `matchId` al cargar matches y al recibir un match nuevo desde likes mutuos. El ID del otro perfil sigue disponible para avatar, perfil y bloqueo.
- Seleccionar un match carga sus mensajes mediante GET. El estado React representa los datos devueltos por la API.
- Las burbujas comparan `mensaje.emisorId` con `currentUserId`, por lo que cada participante ve correctamente su perspectiva del mismo historial.
- Enviar hace POST. Solo agrega el mensaje devuelto y limpia el input después de una respuesta correcta. Los errores muestran un aviso y conservan el borrador. Un bloqueo inmediato mediante ref y el estado disabled evitan envíos simultáneos por Enter/click.
- `useMatchMessages` consulta cada 2,5 segundos después de terminar la consulta anterior. Limpia el temporizador y aborta GET/PATCH pendientes al cambiar match/usuario o desmontar. Descarta respuestas antiguas y respuestas de consultas iniciadas antes de un envío. No reinicia el loader durante actualizaciones.
- App actualiza la lista lateral con otro polling independiente mientras está abierta la pestaña Matches; no desmonta el chat para refrescar previews/no leídos.
- El scroll va al final al abrir y enviar. Al recibir datos se mantiene al final solo si estaba a menos de 100 px del final. Una consulta sin cambios no desplaza el scroll.
- Al cargar mensajes con la conversación visible, se marcan como leídos los recibidos hasta el mayor ID cargado. Los checks propios muestran enviado o leído según el campo real.

Se eliminaron el objeto `conversations` como historial simulado, los IDs `Date.now()`, `sender: 'me'/'them'`, las respuestas automáticas de 1,2 segundos, el indicador de escritura y la presencia «En línea ahora» ficticios. Las sugerencias para iniciar conversación solo completan un borrador; nunca generan mensajes sin envío explícito.

## Archivos

Creados:

- La migración indicada arriba.
- `backend/src/validators/mensaje.validator.js`
- `backend/src/repositories/mensaje.repository.js`
- `backend/src/services/mensaje.service.js`
- `backend/src/controllers/mensaje.controller.js`
- `backend/src/routes/mensaje.routes.js`
- `frontend/src/hooks/useMatchMessages.js`
- `frontend/src/utils/matchUtils.js`
- `backend/test/mensajes.test.js`
- `backend/test/mensajes-ui.test.js`
- `backend/test/mensajes-db.test.js`
- Este documento.

Modificados:

- `backend/prisma/schema.prisma`
- `backend/src/app.js`
- `backend/src/repositories/match.repository.js` (usa el cliente Prisma compartido)
- `backend/src/services/match.service.js`
- `backend/src/controllers/match.controller.js` (usa asyncHandler)
- `frontend/src/App.jsx`
- `frontend/src/components/TinderView/TinderMatches.jsx`
- `frontend/src/services/api.js`
- `frontend/src/App.css`
- `frontend/dist/index.html` y assets producidos por el build.

## Verificación y reproducción

Verificados: Prisma validate/generate, migración aplicada, pruebas de HTTP, transiciones de componentes/hooks y MySQL. Las pruebas cubren pertenencia, inexistentes, vacíos/espacios/límite, bloqueos en ambas direcciones, inactividad, orden cronológico y desempate, igualdad de historial, no leídos, listado por recencia, doble envío, fallos conservando el borrador, cleanup, respuestas tardías y perspectiva A/B/A.

La prueba opt-in de MySQL crea usuarios temporales, verifica persistencia desde una conexión nueva y elimina exclusivamente esos datos al finalizar. Comprueba que los matches e interacciones anteriores siguen intactos.

También se hizo una prueba con los servidores reales: dos usuarios temporales crearon un Match mediante LIKE mutuo y enviaron tres mensajes a través del proxy de Vite. Se detuvo/reinició Vite y se recuperó exactamente el mismo historial desde ambas identidades. Se limpiaron exclusivamente los usuarios y datos temporales de esa prueba.

Limitación: no había un navegador conectado disponible. Se verificaron remontaje y perspectiva mediante componentes/hooks, y el reinicio real del frontend mediante HTTP; no se realizó una recarga visual ni inspección del DOM en navegador. Esbuild informa una clave `getCandidatos` duplicada preexistente en api.js.

La base local ya quedó migrada y ambos servidores reiniciados. No quedan comandos obligatorios para aplicar aquí el cambio. Para otra instalación, desde `backend`, con el servidor detenido durante generate en Windows:

```powershell
npx prisma validate
npx prisma migrate status
# Revisar pendientes antes de aplicar.
npx prisma migrate deploy
npx prisma generate
node --test test/*.test.js
```

Prueba opcional contra MySQL (crea y limpia solo sus datos temporales):

```powershell
$env:RUN_DB_TESTS = '1'
node --test test/mensajes-db.test.js
Remove-Item Env:RUN_DB_TESTS
```

Desde la raíz: `npm --prefix frontend run build`. Para iniciar desarrollo: `npm run dev`.

Prueba manual pendiente en navegador: seleccionar A y abrir su match con B; enviar; seleccionar B y comprobar la burbuja entrante; responder; volver a A; recargar; detener/reiniciar el frontend y volver a abrir el match. Los mismos mensajes deben mantenerse. Un match sin mensajes muestra la invitación a enviar el primero.

No se realizó commit ni push.
