# Propuesta TP DSW

## Grupo
### Integrantes
* 54527 - Volker, Ramiro
* 53935 - Leiva, Milagros
* 54641 - Starna, Adolfo 

### Repositorios
* [frontend app](http://hyperlinkToGihubOrGitlab)
* [backend app](http://hyperlinkToGihubOrGitlab)
*Nota*: si utiliza un monorepo indicar un solo link con fullstack app.

## Tema: 
### Descripción
*Matchify es la app ideal para conocer nuevas personas. Explorá perfiles, filtrá según tus preferencias y generá matches cuando haya interés mutuo. Una vez conectados, podés chatear y empezar a crear nuevas experiencias.*

### Modelo
![[imagen del modelo]([https://imgur.com/a/fkRNebw](https://i.imgur.com/hLJ0P7c.jpeg))]


## Alcance Funcional 

### Alcance Mínimo

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Usuario<br>2. CRUD Ubicacion<br>3. CRUD Hobbie<br>|
|CRUD dependiente|1. CRUD Foto {depende de} CRUD Usuario<br>2. CRUD Bloqueo {depende de} CRUD Usuario<br>3. CRUD Preferencia {depende de} CRUD Usuario<br>4. CRUD Match {depende de} CRUD Usuario<br>5. CRUD Chat {depende de} CRUD Match|
|Listado<br>+<br>detalle| 1. Listado de usuarios filtrado por distancia, muestra usuarios dentro del rango establecido => detalle CRUD Usuario<br>|
|CUU/Epic|1. Login del usuario<br>2. Dar like a otro usuario<br>3. Chatear con otro usuario<br>|









Adicionales para Aprobación
|Req|Detalle|
|:-|:-|
|CRUD |1. CRUD Tipo Habitacion<br>2. CRUD Servicio<br>3. CRUD Localidad<br>4. CRUD Provincia<br>5. CRUD Habitación<br>6. CRUD Empleado<br>7. CRUD Cliente|
|CUU/Epic|1. Reservar una habitación para la estadía<br>2. Realizar el check-in de una reserva<br>3. Realizar el check-out y facturación de estadía y servicios|


### Alcance Adicional Voluntario

*Nota*: El Alcance Adicional Voluntario es opcional, pero ayuda a que la funcionalidad del sistema esté completa y será considerado en la nota en función de su complejidad y esfuerzo.

|Req|Detalle|
|:-|:-|
|Listados |1. Estadía del día filtrado por fecha muestra, cliente, habitaciones y estado <br>2. Reservas filtradas por cliente muestra datos del cliente y de cada reserve fechas, estado cantidad de habitaciones y huespedes|
|CUU/Epic|1. Consumir servicios<br>2. Cancelación de reserva|
|Otros|1. Envío de recordatorio de reserva por email|

