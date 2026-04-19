package fabriziob.com.subastapp.controller.subasta;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import fabriziob.com.subastapp.entity.enums.CategoriaSubasta;
import fabriziob.com.subastapp.entity.enums.EstadoDetalladoSubasta;
import fabriziob.com.subastapp.entity.enums.EstadoPagoDuenio;
import fabriziob.com.subastapp.entity.enums.EstadoSubasta;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/subastas")
@RequiredArgsConstructor
@Tag(name = "Subastas", description = "Gestión de subastas, catálogos y registros")
public class SubastaController {

        // ── Subastas ──────────────────────────────────────────────────────────

        @Operation(summary = "Listar subastas", description = "Devuelve subastas paginadas con filtros opcionales")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Lista de subastas")
        })
        @GetMapping
        public ResponseEntity<Page<SubastaResponse>> getAll(
                        @Parameter(description = "Filtrar por estado (abierta, cerrada)") @RequestParam(required = false) EstadoSubasta estado,
                        @Parameter(description = "Filtrar por categoría (comun, especial, plata, oro, platino)") @RequestParam(required = false) CategoriaSubasta categoria,
                        @Parameter(description = "Filtrar por fecha exacta (yyyy-MM-dd)") @RequestParam(required = false) LocalDate fecha,
                        @PageableDefault(size = 30, sort = "identificador") Pageable pageable) {
                return null;
        }

        @Operation(summary = "Obtener subasta por ID")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Subasta encontrada"),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta no encontrada", content = @Content)
        })
        @GetMapping("/{id}")
        public ResponseEntity<SubastaResponse> getById(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id) {
                return null;
        }

        @Operation(summary = "Crear subasta")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Subasta creada"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content)
        })
        @PostMapping
        public ResponseEntity<SubastaResponse> create(
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos de la subasta") @RequestBody SubastaRequest request) {
                return null;
        }

        @Operation(summary = "Actualizar subasta", description = "Actualiza parcialmente los campos de una subasta")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Subasta actualizada"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta no encontrada", content = @Content)
        })
        @PatchMapping("/{id}")
        public ResponseEntity<SubastaResponse> patch(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Campos a actualizar") @RequestBody SubastaPatchRequest request) {
                return null;
        }

        @Operation(summary = "Cambiar estado de la subasta", description = "Cambia el estado simple (abierta / cerrada)")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Estado actualizado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubastaResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Transición de estado inválida", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta no encontrada", content = @Content)
        })
        @PatchMapping("/{id}/estado")
        public ResponseEntity<SubastaResponse> cambiarEstado(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @Parameter(description = "Nuevo estado", required = true) @RequestParam EstadoSubasta estado) {
                return null;
        }

        @Operation(summary = "Cambiar estado detallado de la subasta", description = "Avanza el estado detallado (creada → publicada → en_curso → cerrada → finalizada)")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Estado detallado actualizado"),
                        @ApiResponse(responseCode = "400", description = "Transición de estado inválida", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta no encontrada", content = @Content)
        })
        @PatchMapping("/{id}/estado-detallado")
        public ResponseEntity<SubastaResponse> cambiarEstadoDetallado(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @Parameter(description = "Nuevo estado detallado", required = true) @RequestParam EstadoDetalladoSubasta estadoDetallado) {
                return null;
        }

        // ── Catálogo ──────────────────────────────────────────────────────────

        @Operation(summary = "Obtener catálogo de la subasta", description = "Devuelve el catálogo con todos sus items")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Catálogo encontrado"),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta no encontrada", content = @Content)
        })
        @GetMapping("/{id}/catalogo")
        public ResponseEntity<CatalogoResponse> getCatalogo(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id) {
                return null;
        }

        @Operation(summary = "Crear catálogo para la subasta")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Catálogo creado"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta no encontrada", content = @Content)
        })
        @PostMapping("/{id}/catalogo")
        public ResponseEntity<CatalogoResponse> createCatalogo(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del catálogo", required = true) @RequestBody CatalogoRequest request) {
                return null;
        }

        @Operation(summary = "Actualizar catálogo")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Catálogo actualizado"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta o catálogo no encontrado", content = @Content)
        })
        @PatchMapping("/{id}/catalogo")
        public ResponseEntity<CatalogoResponse> patchCatalogo(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Campos a actualizar") @RequestBody CatalogoPatchRequest request) {
                return null;
        }

        // ── Items del catálogo ────────────────────────────────────────────────

        @Operation(summary = "Listar items del catálogo")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Lista de items"),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta o catálogo no encontrado", content = @Content)
        })
        @GetMapping("/{id}/catalogo/items")
        public ResponseEntity<Page<ItemCatalogoResponse>> getItems(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id) {
                return null;
        }

        @Operation(summary = "Obtener item del catálogo por ID")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Item encontrado"),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta o item no encontrado", content = @Content)
        })
        @GetMapping("/{id}/catalogo/items/{idItem}")
        public ResponseEntity<ItemCatalogoResponse> getItem(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @Parameter(description = "ID del item", required = true, example = "5") @PathVariable Integer idItem) {
                return null;
        }

        @Operation(summary = "Aceptar o rechazar item del catálogo", description = "Actualiza el estado de aceptación del item (aceptado / rechazado)")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Estado de aceptación actualizado"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta no encontrada", content = @Content)
        })
        @PostMapping("/{id}/catalogo/items/{idItem}/aceptacion")
        public ResponseEntity<ItemCatalogoResponse> setAceptacion(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @Parameter(description = "ID del item", required = true, example = "5") @PathVariable Integer idItem,
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del item", required = true) @RequestBody ItemCatalogoPatchAceptacionRequest request) {
                return null;
        }

        @Operation(summary = "Agregar item al catálogo")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Item agregado"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta no encontrada", content = @Content)
        })
        @PostMapping("/{id}/catalogo/items")
        public ResponseEntity<ItemCatalogoResponse> addItem(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del item", required = true) @RequestBody ItemCatalogoRequest request) {
                return null;
        }

        @Operation(summary = "Actualizar item del catálogo")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Item actualizado"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta o item no encontrado", content = @Content)
        })
        @PatchMapping("/{id}/catalogo/items/{idItem}")
        public ResponseEntity<ItemCatalogoResponse> patchItem(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @Parameter(description = "ID del item", required = true, example = "5") @PathVariable Integer idItem,
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Campos a actualizar", required = true) @RequestBody ItemCatalogoPatchRequest request) {
                return null;
        }

        @Operation(summary = "Eliminar item del catálogo")
        @ApiResponses({
                        @ApiResponse(responseCode = "204", description = "Item eliminado", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta o item no encontrado", content = @Content)
        })
        @DeleteMapping("/{id}/catalogo/items/{idItem}")
        public ResponseEntity<Void> deleteItem(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @Parameter(description = "ID del item", required = true, example = "5") @PathVariable Integer idItem) {
                return null;
        }

        // ── Asistentes ────────────────────────────────────────────────────────

        @Operation(summary = "Listar asistentes activos", description = "Devuelve los clientes conectados actualmente a la subasta")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Lista de asistentes activos"),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta no encontrada", content = @Content)
        })
        @GetMapping("/{id}/asistentes")
        public ResponseEntity<Page<AsistenteResponse>> getAsistentes(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id) {
                return null;
        }

        @Operation(summary = "Unirse a la subasta", description = "Registra al cliente como asistente activo de la subasta")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Cliente unido a la subasta"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos o cliente ya unido", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta o cliente no encontrado", content = @Content)
        })
        @PostMapping("/{id}/asistentes")
        public ResponseEntity<AsistenteResponse> unirse(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del cliente que se une", required = true) @RequestBody AsistenteRequest request) {
                return null;
        }

        @Operation(summary = "Obtener asistencia activa de un cliente", description = "Devuelve la asistencia activa actual del cliente en la subasta")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Asistencia activa encontrada"),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta, cliente o asistencia activa no encontrada", content = @Content)
        })
        @GetMapping("/{id}/asistentes/{idCliente}")
        public ResponseEntity<AsistenteResponse> getAsistenciaActiva(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @Parameter(description = "ID del cliente", required = true, example = "3") @PathVariable Integer idCliente) {
                return null;
        }

        @Operation(summary = "Abandonar la subasta", description = "Marca al asistente como finalizado y registra su hora de salida")
        @ApiResponses({
                        @ApiResponse(responseCode = "204", description = "Asistente removido", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta o asistente no encontrado", content = @Content)
        })
        @DeleteMapping("/{id}/asistentes/{idAsistente}")
        public ResponseEntity<Void> abandonar(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @Parameter(description = "ID del asistente", required = true, example = "3") @PathVariable Integer idAsistente) {
                return null;
        }

        // ── Registro ──────────────────────────────────────────────────────────

        @Operation(summary = "Obtener registros de la subasta", description = "Devuelve el resultado final de la subasta con todos los registros de venta y sus datos extra (estado de pago, envío, cuenta de cobro)")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Registros encontrados"),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta no encontrada", content = @Content)
        })
        @GetMapping("/{id}/registro")
        public ResponseEntity<Page<RegistroDeSubastaResponse>> getRegistro(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id) {
                return null;
        }

        @Operation(summary = "Obtener registro por ID", description = "Devuelve un registro de venta específico con sus datos extra")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Registro encontrado"),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta o registro no encontrado", content = @Content)
        })
        @GetMapping("/{id}/registro/{idRegistro}")
        public ResponseEntity<RegistroDeSubastaResponse> getRegistroById(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @Parameter(description = "ID del registro", required = true, example = "3") @PathVariable Integer idRegistro) {
                return null;
        }

        @Operation(summary = "Agregar registro a la subasta", description = "Registra la venta de un item durante la subasta, incluyendo datos de envío y cuenta de cobro del dueño")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Registro creado"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta no encontrada", content = @Content)
        })
        @PostMapping("/{id}/registro")
        public ResponseEntity<RegistroDeSubastaResponse> addRegistro(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del registro de venta e información de envío y cobro", required = true) @RequestBody RegistroDeSubastaRequest request) {
                return null;
        }

        @Operation(summary = "Actualizar estado de pago del dueño", description = "Avanza el estado de pago al dueño (pendiente → transferido → confirmado)")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Estado actualizado"),
                        @ApiResponse(responseCode = "400", description = "Transición inválida", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta o registro no encontrado", content = @Content)
        })
        @PatchMapping("/{id}/registro/{idRegistro}/estado-pago")
        public ResponseEntity<RegistroDeSubastaResponse> patchEstadoPago(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @Parameter(description = "ID del registro", required = true, example = "3") @PathVariable Integer idRegistro,
                        @Parameter(description = "Nuevo estado de pago", required = true) @RequestParam EstadoPagoDuenio estadoPago) {
                return null;
        }

        @Operation(summary = "Actualizar medio de envío", description = "Cambia el medio de envío del registro (ENVIO_DOMICILIO / RETIRO_DEPOSITO). Si es ENVIO_DOMICILIO, direccionEnvio y paisEnvio pasan a ser requeridos")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Medio de envío actualizado"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos o dirección requerida para envío a domicilio", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta o registro no encontrado", content = @Content)
        })
        @PatchMapping("/{id}/registro/{idRegistro}/medio-envio")
        public ResponseEntity<RegistroDeSubastaResponse> patchMedioEnvio(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @Parameter(description = "ID del registro", required = true, example = "3") @PathVariable Integer idRegistro,
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Nuevo medio de envío y datos opcionales de dirección", required = true) @RequestBody MedioEnvioRequest request) {
                return null;
        }

        // ── Pujos ─────────────────────────────────────────────────────────────

        @Operation(summary = "Listar pujos de la subasta", description = "Devuelve todos los pujos de una subasta ordenados por importe descendente")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Lista de pujos"),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta no encontrada", content = @Content)
        })
        @GetMapping("/{id}/pujos")
        public ResponseEntity<List<PujoResponse>> getPujos(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id) {
                return null;
        }

        @Operation(summary = "Listar pujos de un item", description = "Devuelve todos los pujos de un item específico del catálogo ordenados por importe descendente")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Lista de pujos del item"),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta o item no encontrado", content = @Content)
        })
        @GetMapping("/{id}/catalogo/items/{idItem}/pujos")
        public ResponseEntity<List<PujoResponse>> getPujosByItem(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @Parameter(description = "ID del item", required = true, example = "5") @PathVariable Integer idItem) {
                return null;
        }

        @Operation(summary = "Registrar pujo", description = "Registra un nuevo pujo sobre un item del catálogo. El servidor emite el pujo a `/topic/subastas/{id}/pujas` vía WebSocket")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Pujo registrado"),
                        @ApiResponse(responseCode = "400", description = "Importe inválido o menor al pujo actual", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta o item no encontrado", content = @Content)
        })
        @PostMapping("/{id}/catalogo/items/{idItem}/pujos")
        public ResponseEntity<PujoResponse> addPujo(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @Parameter(description = "ID del item", required = true, example = "5") @PathVariable Integer idItem,
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del pujo", required = true, content = @Content(schema = @Schema(implementation = PujoRequest.class))) @RequestBody PujoRequest request) {
                return null;
        }

        @Operation(summary = "Marcar pujo como ganador", description = "Marca un pujo como ganador del item. Solo un pujo por item puede ser ganador")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Pujo marcado como ganador"),
                        @ApiResponse(responseCode = "400", description = "El item ya tiene un ganador", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Subasta, item o pujo no encontrado", content = @Content)
        })
        @PatchMapping("/{id}/catalogo/items/{idItem}/pujos/{idPujo}/ganador")
        public ResponseEntity<PujoResponse> marcarGanador(
                        @Parameter(description = "ID de la subasta", required = true, example = "1") @PathVariable Integer id,
                        @Parameter(description = "ID del item", required = true, example = "5") @PathVariable Integer idItem,
                        @Parameter(description = "ID del pujo", required = true, example = "8") @PathVariable Integer idPujo) {
                return null;
        }
}
