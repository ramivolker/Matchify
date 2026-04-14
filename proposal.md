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
![Imagen del modelo](./ddsfw.jpg)


## Alcance Funcional 

### Alcance Mínimo

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Usuario<br>2. CRUD Ubicacion<br>3. CRUD Hobbie<br>|
|CRUD dependiente|1. CRUD Preferencia {depende de} CRUD Usuario|
|Listado<br>+<br>detalle| 1. Listado de usuarios filtrado por distancia, muestra usuarios dentro del rango establecido => detalle CRUD Usuario<br>|
|CUU/Epic|1. Matchear con otro usuario<br>2. Bloquear a otro usuario<br>3. Chatear con otro usuario |


Adicionales para Aprobación
|Req|Detalle|
|:-|:-|
|CRUD |1.|
|CUU/Epic|<br>1. Denunciar a otro usuario <br>2. Agregar fotos|

### Alcance Adicional Voluntario

*Nota*: El Alcance Adicional Voluntario es opcional, pero ayuda a que la funcionalidad del sistema esté completa y será considerado en la nota en función de su complejidad y esfuerzo.

Todavía no definido.

|Req|Detalle|
|:-|:-|
|Listados |1. Listado de usuarios filtrados por preferencias de usuario <br>|
|CUU/Epic|1. Terminar Match<br>2. |
|Otros|1. |

