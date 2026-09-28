# Datos de prueba

Desde `backend`, con `DATABASE_URL` configurada en `.env` para tu MySQL de desarrollo:

```sh
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
```

Desde la raíz también podés ejecutar `npm --prefix backend run seed`.
El seed no aplica migraciones automáticamente ni reinicia la base.

Se crean o reutilizan 20 hobbies, 9 ubicaciones y los tipos Estándar y Premium.
Los 18 perfiles ficticios usan emails `@seed.matchify.test`; sus IDs se imprimen
al terminar. No se asume que Mateo tenga ID 1.

Las fechas de nacimiento son fijas. Estos resultados corresponden al 28/09/2026,
para Mateo Ferrero (Rosario, 30 km, edades inclusivas de 25 a 35 años):

| Escenario | Perfiles del seed |
| --- | --- |
| Candidatos válidos | Lucía, Sofía, Valentina, Julián, Camila, Nicolás, Florencia, Victoria |
| Fuera solo por distancia | Tomás, Agustín, Carolina |
| Fuera solo por edad | Bruno, Paula, Martina, Lautaro |
| Fuera por edad y distancia | Diego |
| Inactivo, aunque cumple edad y distancia | Federico |

Mateo se excluye a sí mismo. Con el paso del tiempo las edades cambian, como en
el endpoint real. Las coordenadas representan puntos urbanos aproximados, no
domicilios; el backend calcula distancias geográficas, no distancias por ruta.
Referencia geográfica para Funes, Baigorria y Villa Gobernador Gálvez:
[anexo oficial de localidades](https://www.argentina.gob.ar/normativa/274618_res3687-2_pdf/archivo).

Cada ejecución restaura los datos y preferencias de estos 18 emails y sincroniza
sus 2 a 6 hobbies. Los hobbies y tipos se reutilizan por nombre. Las ubicaciones
se buscan por ciudad, provincia y país y se actualizan con las coordenadas del
seed; si ya hay varias coincidencias se reutiliza la de menor ID, sin borrarlas.
Ejecutar una instancia del seed a la vez; toda la carga ocurre en una transacción.

No se borran usuarios ajenos al seed ni se crean, actualizan o eliminan likes,
dislikes o matches. Por eso, si ya existen interacciones manuales de Mateo, esos
perfiles seguirán excluidos por el endpoint. Otros usuarios preexistentes pueden
aparecer si cumplen sus preferencias: la tabla describe solo los perfiles del seed.
