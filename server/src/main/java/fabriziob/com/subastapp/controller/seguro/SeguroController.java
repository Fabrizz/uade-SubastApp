package fabriziob.com.subastapp.controller.seguro;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fabriziob.com.subastapp.service.SeguroService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/seguros")
@RequiredArgsConstructor
@Tag(name = "Seguros", description = "Gestión de pólizas de seguro")
public class SeguroController {

    private final SeguroService seguroService;

    @Operation(summary = "Listar seguros", description = "Devuelve todas las pólizas de seguro registradas")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de seguros")
    })
    @GetMapping
    public List<SeguroResponse> getAll() {
        return seguroService.getAll();
    }

    @Operation(summary = "Obtener seguro por número de póliza")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Seguro encontrado"),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Seguro no encontrado", content = @Content)
    })
    @GetMapping("/{nroPoliza}")
    public ResponseEntity<SeguroResponse> getById(
            @Parameter(description = "Número de póliza", required = true, example = "POL-00123") @PathVariable String nroPoliza) {
        return seguroService.getById(nroPoliza)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Crear seguro")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Seguro creado"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content)
    })
    @PostMapping
    public ResponseEntity<SeguroResponse> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos de la póliza de seguro", required = true) @RequestBody SeguroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(seguroService.create(request));
    }

    @Operation(summary = "Eliminar seguro")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Seguro eliminado", content = @Content),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Seguro no encontrado", content = @Content)
    })
    @DeleteMapping("/{nroPoliza}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "Número de póliza", required = true, example = "POL-00123") @PathVariable String nroPoliza) {
        return seguroService.delete(nroPoliza)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}