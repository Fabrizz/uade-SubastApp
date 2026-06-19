# Walkthrough - Product/Article Registration & Acceptance Loop

We have successfully implemented the full **Product offering, inspection, and catalog item acceptance loop** for users, matching all the specifications detailed in [TPO-DAI.md](file:///C:/Users/tomas/OneDrive/Documents/Facultad/Desarrollo%20de%20aplicaciones%201/uade-SubastApp/TPO-DAI.md).

---

## What We Implemented

### 1. Backend (Spring Boot Server)
- **Catalog Item Lookup by Product**: Added `getCatalogoItemByProducto` endpoint (`GET /api/v1/subastas/catalogo/items/producto/{productoId}`) inside [SubastaController.java](file:///c:/Users/tomas/OneDrive/Documents/Facultad/Desarrollo%20de%20aplicaciones%201/uade-SubastApp/server/src/main/java/fabriziob/com/subastapp/controller/subasta/SubastaController.java) and [CatalogoService.java](file:///c:/Users/tomas/OneDrive/Documents/Facultad/Desarrollo%20de%20aplicaciones%201/uade-SubastApp/server/src/main/java/fabriziob/com/subastapp/service/CatalogoService.java) to allow the owner to find their proposed catalog items and base prices.
- **Product Acceptance & Rejection**: Wired up `/aceptacion` (`POST /api/v1/subastas/{id}/catalogo/items/{idItem}/aceptacion`), `/patchItem`, and `/deleteItem` endpoints in [SubastaController.java](file:///c:/Users/tomas/OneDrive/Documents/Facultad/Desarrollo%20de%20aplicaciones%201/uade-SubastApp/server/src/main/java/fabriziob/com/subastapp/controller/subasta/SubastaController.java) to let users accept/reject the catalog pricing or allow admins to delete catalog entries.
- **Owner Products Endpoint**: Connected `/api/v1/duenios/{id}/productos` inside [DuenioController.java](file:///c:/Users/tomas/OneDrive/Documents/Facultad/Desarrollo%20de%20aplicaciones%201/uade-SubastApp/server/src/main/java/fabriziob/com/subastapp/controller/duenio/DuenioController.java) and [DuenioService.java](file:///c:/Users/tomas/OneDrive/Documents/Facultad/Desarrollo%20de%20aplicaciones%201/uade-SubastApp/server/src/main/java/fabriziob/com/subastapp/service/DuenioService.java) to pull the user's registered articles from the database.
- **Lombok Bugfix**: Fixed the compilation issue in [ProductoService.java](file:///c:/Users/tomas/OneDrive/Documents/Facultad/Desarrollo%20de%20aplicaciones%201/uade-SubastApp/server/src/main/java/fabriziob/com/subastapp/service/ProductoService.java) regarding `ProductoSeguroResponse` fields (`hasSeguro`, `nroPoliza` etc.) to follow the strict OpenAPI types schema.

### 2. Frontend (Expo / React Native Client)
- **Dynamic Offer List**: Refactored the Auctions tab index [index.tsx](file:///c:/Users/tomas/OneDrive/Documents/Facultad/Desarrollo%20de%20aplicaciones%201/uade-SubastApp/client/app/%28tabs%29/auctions/index.tsx) to fetch the user's products from `/api/v1/duenios/{user.id}/productos` and render real status badges (En Revisión, Inspeccionado, Propuesta Recibida, Aceptada, Rechazada).
- **Required 6-Photo Validation & Custom Fields**: Upgraded the new product creation screen [index.tsx](file:///c:/Users/tomas/OneDrive/Documents/Facultad/Desarrollo%20de%20aplicaciones%201/uade-SubastApp/client/app/%28tabs%29/auctions/new/index.tsx) to enforce at least 6 photos, add input fields for *Artista*, *Año de Creación*, and *Historia* (per TPO requirements), and added 3 mandatory legal declaration checkboxes for property ownership, licit origin, and return cargos.
- **Auto-Owner Registration**: Before calling the multipart upload, the client checks if the user has an owner (`Duenio`) profile and registers them automatically if they don't, which keeps testing seamless.
- **Dynamic Verification Screen**: Connected [auction-verification.tsx](file:///c:/Users/tomas/OneDrive/Documents/Facultad/Desarrollo%20de%20aplicaciones%201/uade-SubastApp/client/app/%28tabs%29/auctions/new/auction-verification.tsx) to read query parameters and display the dynamic review status or the specific rejection reasons entered by the admin.
- **Dynamic Accepted Proposal Review**: Refactored [auction-accepted.tsx](file:///c:/Users/tomas/OneDrive/Documents/Facultad/Desarrollo%20de%20aplicaciones%201/uade-SubastApp/client/app/%28tabs%29/auctions/new/auction-accepted.tsx) to show the proposed subasta details (date, hour, location), base price, and commission, allowing the owner to accept or reject (devolution with cargo).

---

## How to Add an Article (Step-by-Step Testing Flow)

Here is how you or the professor can test this flow end-to-end:

### Paso 1: Ofrecer un Artículo (Como Usuario Oferente/Dueño)
1. Inicia sesión en la app con un usuario regular (o admin).
2. Ve al tab **Subastas** (ícono de martillo) en la barra inferior.
3. Haz clic en **Solicitar subasta**.
4. Completa los campos:
   - **Nombre del artículo** (Ej: *Reloj de oro vintage*) y **Descripción breve**.
   - **Fotos**: Debes subir **al menos 6 fotos** (el sistema bloqueará el registro si hay menos de 6).
   - **Campos opcionales**: Artista/Diseñador, Año de creación, e Historia de procedencia.
   - **Declaraciones Juradas**: Marca los **3 casilleros obligatorios** (propiedad, origen lícito y costos de devolución).
5. Haz clic en **Solicitar subasta de artículo**. La app registrará al usuario como `Duenio` (si no lo estaba), subirá los datos y las imágenes mediante multipart y volverá.
6. Verás tu artículo en la lista de "Mis artículos ofrecidos" con el estado **EN REVISIÓN**. Al tocarlo, se abrirá la pantalla de revisión dinámica.

### Paso 2: Aceptar e Incluir en Catálogo (Como Admin)
1. Cierra sesión e ingresa como **admin**.
2. Ve al Panel Admin $\rightarrow$ **Subastas**.
3. Selecciona una subasta activa y haz clic en **Gestionar Lotes (Catálogo)**.
4. Si no tiene catálogo, inicialízalo.
5. En **Agregar Lote (Asignar Artículo)**, abre el dropdown y selecciona tu artículo recién creado.
6. Ingresa un **Precio Base** (ej: `$50,000`) y **Comisión** (ej: `10`).
7. Haz clic en **Agregar Lote al Catálogo**. Esto crea la propuesta comercial en el catálogo.

### Paso 3: Aceptar o Rechazar Propuesta Comercial (Como Dueño)
1. Cierra sesión e ingresa de nuevo con tu usuario regular.
2. Ve al tab **Subastas**. Ahora verás que el artículo está en estado **PROPUESTA RECIBIDA**.
3. Toca sobre el artículo. Se abrirá la pantalla detallada de la propuesta comercial mostrando:
   - El precio base propuesto.
   - La comisión de la empresa.
   - Fecha, hora y lugar de la futura subasta.
   - Póliza de seguro contratada.
4. El usuario puede:
   - **Rechazar**: Al hacer clic en Rechazo, se registra el rechazo (`rechazado`) y el bien procede a devolución con cargo de `$5 USD`.
   - **Aceptar**: Al hacer clic en Acepto, el item queda formalmente aprobado (`aceptado`) y listo para la subasta en vivo.

---

## Bugfix: Registro como Dueño ("No me deja registrarme como duenio")

### Causa Raíz
El error se producía al intentar auto-registrar un usuario como Dueño (`Duenio`) mediante el endpoint `POST /api/v1/duenios` desde el cliente Expo.
En `DuenioService.java`, el método `create()` construía el objeto `Duenio` utilizando `Duenio.builder().identificador(persona.getIdentificador())`.
Debido a que el campo primary key (`@Id` `identificador`) se seteaba explícitamente en el builder, Spring Data JPA asumía que la entidad ya existía en la base de datos (puesto que el valor de la clave primaria no era nulo). En consecuencia, llamaba a `entityManager.merge()` en lugar de `entityManager.persist()`.
Dado que la entidad `Duenio` utiliza `@MapsId` vinculada a la relación `@OneToOne` con `Persona`, Hibernate fallaba al intentar hacer `merge` sobre una relación nueva que aún no estaba guardada en el contexto de persistencia, arrojando la excepción:
`org.hibernate.AssertionFailure: null identifier (fabriziob.com.subastapp.entity.Duenio)`

### Solución Implementada
1. **Remoción de Identificador Manual en Backend**: Modificamos [DuenioService.java](file:///c:/Users/tomas/OneDrive/Documents/Facultad/Desarrollo%20de%20aplicaciones%201/uade-SubastApp/server/src/main/java/fabriziob/com/subastapp/service/DuenioService.java) eliminando `.identificador(persona.getIdentificador())` en la llamada a `Duenio.builder()`. Con esto, JPA/Hibernate detecta correctamente que es una nueva entidad y deriva e inserta la clave automáticamente copiándola de `persona` mediante la anotación `@MapsId`.
2. **Mejora de Logs de Error en el Cliente**:
   - En [index.tsx](file:///c:/Users/tomas/OneDrive/Documents/Facultad/Desarrollo%20de%20aplicaciones%201/uade-SubastApp/client/app/%28tabs%29/auctions/new/index.tsx), refactorizamos el bloque `catch` para extraer y mostrar en el `Alert.alert` el campo `mensaje` o `message` específico retornado por el API del servidor en lugar de usar un texto genérico.
   - En [auctions.tsx](file:///c:/Users/tomas/OneDrive/Documents/Facultad/Desarrollo%20de%20aplicaciones%201/uade-SubastApp/client/app/admin/auctions.tsx), también añadimos soporte para leer el campo `mensaje` retornado por la validación del backend en la registración rápida de dueño. Adicionalmente, agregamos alertas informativas explícitas si las credenciales de sesión o el ID de usuario no están presentes, evitando retornos silenciosos que dificultaban el diagnóstico al usuario.

