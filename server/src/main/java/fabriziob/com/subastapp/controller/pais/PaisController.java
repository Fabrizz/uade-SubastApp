package fabriziob.com.subastapp.controller.pais;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fabriziob.com.subastapp.entity.Pais;
import fabriziob.com.subastapp.service.PaisService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/paises")
@RequiredArgsConstructor
@Tag(name = "Países", description = "Gestión de países")
public class PaisController {

        private final PaisService paisService;

        @Operation(summary = "Listar países", description = "Devuelve todos los países paginados")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Lista paginada de países")
        })
        @GetMapping
        public ResponseEntity<Page<PaisResponse>> getAll(
                        @PageableDefault(size = 30, sort = "nombre") Pageable pageable) {
                return ResponseEntity.ok(paisService.findAll(pageable).map(this::toResponse));
        }

        @Operation(summary = "Obtener país por ID")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "País encontrado"),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "País no encontrado", content = @Content)
        })
        @GetMapping("/{id}")
        public ResponseEntity<PaisResponse> getById(
                        @Parameter(description = "ID del país", required = true, example = "1") @PathVariable Integer id) {
                return ResponseEntity.ok(toResponse(paisService.findById(id)));
        }

        @Hidden
        @Operation(summary = "Crear país")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "País creado"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content)
        })
        @PostMapping
        public ResponseEntity<PaisResponse> create(
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del país", required = true) @RequestBody PaisRequest request) {
                Pais pais = Pais.builder()
                                .numero(request.getNumero())
                                .nombre(request.getNombre())
                                .nombreCorto(request.getNombreCorto())
                                .capital(request.getCapital())
                                .nacionalidad(request.getNacionalidad())
                                .idiomas(request.getIdiomas())
                                .build();
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(toResponse(paisService.create(pais)));
        }

        @Hidden
        @Operation(summary = "Eliminar país")
        @ApiResponses({
                        @ApiResponse(responseCode = "204", description = "País eliminado", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "País no encontrado", content = @Content)
        })
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> delete(
                        @Parameter(description = "ID del país", required = true, example = "1") @PathVariable Integer id) {
                paisService.delete(id);
                return ResponseEntity.noContent().build();
        }

        private PaisResponse toResponse(Pais p) {
                return PaisResponse.builder()
                                .numero(p.getNumero())
                                .nombre(p.getNombre())
                                .nombreCorto(p.getNombreCorto())
                                .capital(p.getCapital())
                                .nacionalidad(p.getNacionalidad())
                                .idiomas(p.getIdiomas())
                                .build();
        }
}
