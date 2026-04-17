package fabriziob.com.subastapp.controller.subastador;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fabriziob.com.subastapp.entity.Subastador;
import fabriziob.com.subastapp.repository.SubastadorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/subastadores")
@RequiredArgsConstructor
@Tag(name = "Subastadores", description = "Gestión de subastadores")
public class SubastadorController {

    private final SubastadorService subastadorService;

    private static final String R_401 = "No autenticado";
    private static final String R_403 = "Sin permisos para acceder a este recurso";
    private static final String R_404 = "Subastador no encontrado";

    @Operation(summary = "Listar subastadores", description = "Devuelve todos los subastadores registrados")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de subastadores"),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
    })
    @GetMapping
    public Page<SubastadorResponse> getAll() {
        return null;
    }

    @Operation(summary = "Obtener subastador por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Subastador encontrado"),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
            @ApiResponse(responseCode = "404", description = R_404, content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<SubastadorResponse> getById(
            @Parameter(description = "ID del subastador", required = true, example = "1") @PathVariable Integer id) {
        return subastadorService.getById(id)
                .map(s -> ResponseEntity.ok(toResponse(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Crear subastador")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Subastador creado"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
            @ApiResponse(responseCode = "404", description = R_404, content = @Content)
    })
    @PostMapping
    public ResponseEntity<SubastadorResponse> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del subastador a crear", required = true) @RequestBody SubastadorRequest request) {
        Subastador saved = subastadorService.create(
                request.getIdentificador(),
                request.getMatricula(),
                request.getRegion());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @Operation(summary = "Actualizar subastador", description = "Reemplaza completamente los datos de un subastador existente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Subastador actualizado"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
            @ApiResponse(responseCode = "404", description = R_404, content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<SubastadorResponse> update(
            @Parameter(description = "ID del subastador", required = true, example = "1") @PathVariable Integer id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Nuevos datos del subastador", required = true) @RequestBody SubastadorRequest request) {
        return subastadorService.update(id, request.getMatricula(), request.getRegion())
                .map(s -> ResponseEntity.ok(toResponse(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Eliminar subastador")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Subastador eliminado"),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
            @ApiResponse(responseCode = "404", description = R_404, content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID del subastador") @PathVariable Integer id) {
        return subastadorService.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    private SubastadorResponse toResponse(Subastador s) {
        return SubastadorResponse.builder()
                .identificador(s.getIdentificador())
                .matricula(s.getMatricula())
                .region(s.getRegion())
                .build();
    }
}