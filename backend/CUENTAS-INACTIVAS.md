# Cuentas inactivas

Se reutiliza Usuario.activo. No se agrega modelo ni migracion. La sancion solo actualiza activo y la marca actualizadoEn existente. Nunca borra asociaciones ni cambia estados de reportes o matches.

## Operaciones administrativas

PATCH /api/usuarios/:id/estado recibe exclusivamente { "activo": false } o { "activo": true }. Valida ID, existencia y tipo booleano. Es idempotente y reutiliza usuarioRepository.actualizar. GET /api/usuarios, GET /api/usuarios/:id y el PUT administrativo conservan su comportamiento para consultar/editar cuentas inactivas.

El detalle de reporte muestra ACTIVO/INACTIVO y solicita confirmacion para desactivar o reactivar. Durante la peticion deshabilita las acciones; un error conserva la confirmacion y muestra el error real. El exito conserva abierto el reporte y actualiza usuarios y todas sus referencias en la lista de reportes. La accion sigue disponible en reportes cerrados. Resolver y Descartar siguen siendo independientes.

## Acceso de usuarios normales

usuario-activo.service.js centraliza existencia y estado activo; devuelve 404 si no existe y 403 si esta desactivado. Puede validar un usuario ya consultado o consultar solo id/activo a traves del repository, con soporte para transacciones.

Se comprueba en:

- GET /api/usuarios/:id/candidatos (solicitante). El filtro activo:true de candidatos ya existia y se conserva.
- POST /api/interacciones (emisor y destinatario).
- GET /api/matches/:usuarioId.
- GET/POST /api/matches/:matchId/mensajes y PATCH .../mensajes/leidos (actor, dentro de la transaccion existente).
- POST/GET/PUT/DELETE de /api/usuarios/:usuarioId/preferencia.
- PATCH /api/usuarios/:id/perfil, usado por Mi Perfil. No admite activo ni tipoUsuarioId; el PUT administrativo permanece intacto.
- Mutaciones de fotos y hobbies del perfil.
- Acciones de bloqueo/desbloqueo y consulta de bloqueados del actor.
- POST /api/reportes (reportante). Un usuario activo puede reportar un perfil inactivo.

Las lecturas administrativas de usuarios, reportes, fotos y hobbies siguen disponibles para revisar los datos conservados.

AuthView excluye inactivos de los accesos rapidos y rechaza su email. App vuelve a consultar el estado actual antes de aceptar un login, verifica sesiones restauradas antes de operar y revisa la cuenta cada 5 segundos. La desactivacion cierra la sesion normal; los errores de red suspenden la interfaz hasta verificar nuevamente. El backend rechaza las nuevas peticiones de cuentas inactivas sin esperar ese intervalo. No se crean identidades demo cuando la lista de usuarios esta vacia.

## Limite de seguridad actual

No se implemento JWT ni autenticacion real. En produccion la validacion de activo debe ejecutarse sobre el usuario autenticado obtenido de sesion/token, no sobre un ID confiado al cliente. Los endpoints administrativos, incluido PUT de usuario y PATCH de estado, siguen sin autorizacion productiva; no se puede impedir que un cliente invoque herramientas administrativas o suplante otra identidad mientras esa capa no exista. El acceso admin de demostracion sigue disponible. La validacion agregada impide operar con un ID inactivo en las rutas normales indicadas.

## Pruebas

Desde backend, PowerShell:

    $env:RUN_DB_TESTS='1'
    node --test --test-concurrency=1

usuario-estado-db.test.js usa MySQL real, HTTP real y una segunda conexion para verificar persistencia. Crea usuarios propios y compara los registros historicos completos antes/despues de desactivar, rechazar acciones y reactivar. Al finalizar elimina solo sus registros temporales.

usuario-estado-ui.test.js ejecuta handlers y hooks reales con el harness del proyecto: confirmacion/cancelacion/error, reactivacion, selector/login y sesion restaurada. Es una prueba de interaccion de componentes, no una prueba visual en navegador.

El harness de genero-ui.test.js se adapta al editor actual (useRef, portal, Cancelar y API de perfil), sin cambios de comportamiento en el editor por ese ajuste.

Validacion realizada: 58 pruebas aprobadas, cero fallos y cero omisiones (RUN_DB_TESTS=1); prisma validate correcto; build Vite correcto con salida temporal para preservar dist.


## Archivos de esta ampliacion

Backend nuevos: src/services/usuario-activo.service.js; test/usuario-estado-db.test.js; test/usuario-estado-ui.test.js; CUENTAS-INACTIVAS.md.

Backend modificados: controllers/usuario.controller.js, interaccion.controller.js y bloqueo.controller.js; routes/usuario.routes.js; validators/usuario.validator.js; repositories/usuario.repository.js, candidato.repository.js, mensaje.repository.js y reporte.repository.js; services/usuario.service.js, candidato.service.js, interaccion.service.js, mensaje.service.js, match.service.js, preferencia.service.js, foto.service.js, usuario-hobbie.service.js, bloqueo.service.js y reporte.service.js (todos dentro de src/). Tambien REPORTES.md y las pruebas genero-ui.test.js, mensajes.test.js y preferencias-candidatos.test.js.

Frontend nuevo: src/components/AdminView/CuentaEstadoConfirmModal.jsx.
Frontend modificados: src/App.jsx, src/components/AuthView.jsx, src/components/AdminView/ReportesTab.jsx, src/components/TinderView/MiPerfilTab.jsx y src/services/api.js.

No se modifican schema.prisma ni migraciones en esta ampliacion; sus cambios de Reporte pertenecen a la implementacion anterior. Se preservan los cambios previos del usuario, incluido dist.
