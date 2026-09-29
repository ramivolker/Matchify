# Reset de interacciones para desarrollo

En Admin, la sección **Herramientas de desarrollo** permite resetear todas las
interacciones o seleccionar un usuario por nombre e ID. Ambas acciones requieren
confirmación y muestran las cantidades eliminadas.

El backend debe ejecutarse con `NODE_ENV` distinto de `production`. En producción
las tres rutas siguientes responden 403 antes de acceder a Prisma, y la interfaz
oculta los controles. Esto es una protección por entorno, no autenticación:
configurar siempre `NODE_ENV=production` al desplegar.

| Método y ruta | Operación |
| --- | --- |
| `GET /api/dev/interacciones` | Informa `{ "habilitado": true }` en desarrollo; no modifica datos. |
| `DELETE /api/dev/interacciones` | Elimina todos los `Match` (activos e inactivos) y todas las `Interaccion` (LIKE y DISLIKE). |
| `DELETE /api/dev/usuarios/:usuarioId/interacciones` | Elimina matches donde el usuario sea `usuario1Id` o `usuario2Id`, e interacciones donde sea emisor o destinatario. Conserva relaciones entre los demás usuarios. |

Cada reset se realiza en una transacción Prisma: primero matches y después
interacciones. Ambos modelos referencian solamente a Usuario. Se conservan todos
los Usuario, Preferencia, UsuarioHobbie, Hobbie, Ubicacion y TipoUsuario. No se
ejecuta el seed ni se reinician los contadores de IDs. Un ID inválido devuelve 400;
un usuario inexistente, 404. Repetir el reset devuelve cantidades cero.

Respuesta de ejemplo:

```json
{ "interaccionesEliminadas": 5, "matchesEliminados": 2 }
```

Tras el éxito, la aplicación limpia sus candidatos, perfiles vistos, matches y
chat seleccionado en memoria. Al entrar en Tinder consulta nuevamente los
endpoints existentes de candidatos y matches para el usuario seleccionado. Los
bloqueos/reportes locales se conservan. Otras pestañas abiertas deben recargarse.

Verificación desde la raíz del repositorio:

```sh
node --test backend/test/dev-reset.test.js
npm --prefix frontend run build
```

La prueba HTTP utiliza las capas reales con un doble transaccional de Prisma:
comprueba el bloqueo en producción, validación, alcance, cantidades, repetición y
propagación de fallos sin tocar la base de desarrollo.
