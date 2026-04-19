package fabriziob.com.subastapp.controller.notificacion;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/notificaciones")
@RequiredArgsConstructor
@Tag(name = "Notificaciones", description = "Gestión de notificaciones para personas, clientes, dueños y subastadores")
public class NotificacionController {

    @Operation(summary = "Listar notificaciones de una persona", description = "Devuelve las notificaciones paginadas de un destinatario, con filtros opcionales por tipo y estado de lectura")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista paginada de notificaciones"),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Persona no encontrada", content = @Content)
    })
    @GetMapping
    public ResponseEntity<Page<NotificacionResponse>> getAll(
            @Parameter(description = "ID del destinatario", required = true, example = "1") @RequestParam Integer destinatarioId,
            @Parameter(description = "Filtrar por tipo (info, exito, advertencia, error, subasta, pago, envio)") @RequestParam(required = false) String tipo,
            @Parameter(description = "Filtrar por estado de lectura") @RequestParam(required = false) Boolean leida,
            @PageableDefault(size = 20, sort = "fecha") Pageable pageable) {
        return null;
    }

    @Operation(summary = "Obtener notificación por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Notificación encontrada"),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Notificación no encontrada", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<NotificacionResponse> getById(
            @Parameter(description = "ID de la notificación", required = true, example = "1") @PathVariable Integer id) {
        return null;
    }

    @Operation(summary = "Marcar notificación como leída")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Notificación marcada como leída"),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Notificación no encontrada", content = @Content)
    })
    @PatchMapping("/{id}/leer")
    public ResponseEntity<NotificacionResponse> marcarLeida(
            @Parameter(description = "ID de la notificación", required = true, example = "1") @PathVariable Integer id) {
        return null;
    }
}