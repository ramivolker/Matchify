# Reportes

## Contexto / evidencia de la conversación

GET /api/reportes/:id/conversacion resuelve los dos participantes desde el reporte validado. Busca el match por la clave compuesta usuario1Id/usuario2Id (menor/mayor ID), sin filtrar por actividad, bloqueo ni estado del reporte. Reutiliza match.repository.obtenerEntreUsuarios y mensaje.repository.obtenerHistorial; ordena por enviadoEn e id ascendentes. Solo devuelve identidad básica, estado del match y mensajes de ese match. La respuesta no se almacena en caché.

El administrador puede consultar únicamente la conversación entre el reportante y el usuario reportado como contexto del reporte. No se expone acceso general a conversaciones privadas.

En una versión productiva este endpoint debe requerir un usuario autenticado con rol ADMINISTRADOR. Actualmente no hay autenticación/autorización real en backend: cualquier cliente con acceso a la API puede consultar esta ruta. Ocultar controles del frontend no constituye seguridad. No se implementa JWT en esta tarea.

La operación es exclusivamente de lectura: no marca mensajes leídos ni modifica fechas, usuarios, matches o reportes. Los matches y usuarios inactivos conservan acceso al historial; la eliminación física mantiene las cascadas existentes y no garantiza retención de evidencia.

El detalle carga una instantánea al abrir, sin polling. El visor reutiliza estilos de burbujas del chat, muestra nombres y fecha/hora, tiene scroll interno y no incluye controles para enviar, editar o borrar. Sin match muestra “No existe una conversación entre estos usuarios.”; con match vacío muestra “Estos usuarios hicieron Match, pero no intercambiaron mensajes.”.

Prueba de defensa: abrir un reporte con mensajes, revisar el contador, abrir Ver conversación, identificar ambos emisores y comprobar que no existe entrada de texto. Cerrar el visor y resolver/descartar o moderar la cuenta. Reabrir el detalle para verificar disponibilidad del contexto histórico. Repetir con match inactivo, sin mensajes y sin match, en temas claro y oscuro.

Pruebas automatizadas: node --test test/reporte-conversacion.test.js test/reportes.test.js test/reportes-ui.test.js. La prueba de contexto ejecuta HTTP y repositorios con un doble de Prisma que no ofrece métodos de escritura; verifica aislamiento, orden, inactividad, estados y ausencia de mutaciones. No sustituye una prueba de integración MySQL.

Circuito: ReportModal -> POST /api/reportes -> Reporte (MySQL) -> Reportes del administrador -> cierre.

- Los cinco motivos originales se definen en src/constants/reporte.js. El frontend consulta GET /api/reportes/motivos para mostrar el mismo catalogo; motivo se almacena como String.
- Descripcion opcional, hasta 300 caracteres. El servidor valida IDs, existencia de ambos usuarios, motivo y autorreporte.
- Estado inicial PENDIENTE. Solo se permite PENDIENTE -> RESUELTO o DESCARTADO; ambos asignan resueltoEn. No se reabren ni se cambia un cierre previo. La actualizacion condicional evita cierres simultaneos contradictorios.
- Resolver significa revisado y cerrado. Descartar significa cerrado sin darle curso. Ninguno bloquea, desactiva o elimina usuarios. El bloqueo se mantiene como accion independiente en las acciones del perfil.
- El contador deriva de los reportes PENDIENTES del estado compartido en App. Se consulta al ingresar como administrador y cada 15 segundos, y se actualiza inmediatamente al cerrar un reporte. Un error de carga se muestra como desconocido, sin simular cero pendientes.
- Las relaciones usan onDelete: Cascade, como las asociaciones existentes, para mantener compatible la eliminacion administrativa de usuarios. Eliminar un usuario tambien elimina sus reportes; no se implementa retencion historica de usuarios eliminados.
- Se conserva el esquema de acceso actual del proyecto: la sesion/rol es del frontend y el backend no tiene autenticacion. Estos endpoints tampoco agregan autenticacion; restringir realmente las consultas y cierres requiere una futura capa comun de autenticacion/autorizacion. El ID reportante deberia provenir de esa sesion autenticada cuando exista.

## Endpoints

POST /api/reportes (201)
GET /api/reportes [?estado=PENDIENTE|RESUELTO|DESCARTADO]
GET /api/reportes/:id
PATCH /api/reportes/:id/estado { estado: RESUELTO|DESCARTADO }
GET /api/reportes/motivos

## Verificacion

Desde backend:

    npx prisma validate
    npx prisma migrate deploy
    npx prisma generate
    node --test test/reportes.test.js test/reportes-ui.test.js

La prueba HTTP usa un doble de Prisma. La prueba UI ejecuta componentes y handlers mediante el harness de hooks usado por el proyecto; no es una prueba visual de navegador.
La prueba MySQL usa registros temporales propios, verifica lectura desde otra conexion y limpia esos registros al terminar:

    $env:RUN_DB_TESTS='1'
    node --test test/reportes-db.test.js

Desde frontend, npm run build. Para preservar un dist con cambios previos se puede usar -- --outDir ../.tmp-reportes-build.


## Estado de cuenta desde Reportes

El detalle ofrece Desactivar usuario / Reactivar usuario, con confirmacion separada. Reutiliza Usuario.activo y PATCH /api/usuarios/:id/estado. No modifica el reporte y no elimina datos. Ver CUENTAS-INACTIVAS.md para las rutas protegidas y la limitacion de identidad de prueba.
