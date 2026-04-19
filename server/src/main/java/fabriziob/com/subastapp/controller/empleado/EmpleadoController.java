package fabriziob.com.subastapp.controller.empleado;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fabriziob.com.subastapp.entity.Empleado;
import fabriziob.com.subastapp.entity.Persona;
import fabriziob.com.subastapp.entity.Sector;
import fabriziob.com.subastapp.service.EmpleadoService;
import fabriziob.com.subastapp.service.SectorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/empleados")
@RequiredArgsConstructor
@Tag(name = "Empleados", description = "Gestión de empleados y sectores (uso interno)")
public class EmpleadoController {

        private final SectorService sectorService;
        private final EmpleadoService empleadoService;

        // ── Sectores ──────────────────────────────────────────────────────────

        @Operation(summary = "Listar sectores", description = "Devuelve todos los sectores paginados")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Lista paginada de sectores")
        })
        @GetMapping("/sectores")
        public ResponseEntity<Page<SectorResponse>> getAllSectores(
                        @PageableDefault(size = 30, sort = "nombreSector") Pageable pageable) {
                return ResponseEntity.ok(sectorService.findAll(pageable).map(this::toSectorResponse));
        }

        @Operation(summary = "Obtener sector por ID")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Sector encontrado"),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Sector no encontrado", content = @Content)
        })
        @GetMapping("/sectores/{id}")
        public ResponseEntity<SectorResponse> getSectorById(
                        @Parameter(description = "ID del sector", required = true, example = "1") @PathVariable Integer id) {
                return ResponseEntity.ok(toSectorResponse(sectorService.findById(id)));
        }

        @Operation(summary = "Crear sector")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Sector creado"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content)
        })
        @PostMapping("/sectores")
        public ResponseEntity<SectorResponse> createSector(
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del sector", required = true) @RequestBody SectorRequest request) {
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(toSectorResponse(sectorService.create(request)));
        }

        @Operation(summary = "Actualizar sector", description = "Actualiza parcialmente los campos de un sector")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Sector actualizado"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Sector no encontrado", content = @Content)
        })
        @PatchMapping("/sectores/{id}")
        public ResponseEntity<SectorResponse> updateSector(
                        @Parameter(description = "ID del sector", required = true, example = "1") @PathVariable Integer id,
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Campos a actualizar", required = true) @RequestBody SectorRequest request) {
                return ResponseEntity.ok(toSectorResponse(sectorService.update(id, request)));
        }

        @Operation(summary = "Eliminar sector")
        @ApiResponses({
                        @ApiResponse(responseCode = "204", description = "Sector eliminado", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Sector no encontrado", content = @Content)
        })
        @DeleteMapping("/sectores/{id}")
        public ResponseEntity<Void> deleteSector(
                        @Parameter(description = "ID del sector", required = true, example = "1") @PathVariable Integer id) {
                sectorService.delete(id);
                return ResponseEntity.noContent().build();
        }

        // ── Empleados ─────────────────────────────────────────────────────────

        @Operation(summary = "Listar empleados", description = "Devuelve todos los empleados paginados")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Lista paginada de empleados")
        })
        @GetMapping("/")
        public ResponseEntity<Page<EmpleadoResponse>> getAllEmpleados(
                        @PageableDefault(size = 20, sort = "identificador") Pageable pageable) {
                return ResponseEntity.ok(empleadoService.findAll(pageable).map(this::toEmpleadoResponse));
        }

        @Operation(summary = "Obtener empleado por ID")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Empleado encontrado"),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Empleado no encontrado", content = @Content)
        })
        @GetMapping("/{id}")
        public ResponseEntity<EmpleadoResponse> getEmpleadoById(
                        @Parameter(description = "ID del empleado", required = true, example = "1") @PathVariable Integer id) {
                return ResponseEntity.ok(toEmpleadoResponse(empleadoService.findById(id)));
        }

        @Operation(summary = "Crear empleado")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Empleado creado"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content)
        })
        @PostMapping("/")
        public ResponseEntity<EmpleadoResponse> createEmpleado(
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del empleado", required = true) @RequestBody EmpleadoRequest request) {
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(toEmpleadoResponse(empleadoService.create(request)));
        }

        @Operation(summary = "Actualizar empleado", description = "Actualiza parcialmente los campos de un empleado")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Empleado actualizado"),
                        @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Empleado no encontrado", content = @Content)
        })
        @PatchMapping("/{id}")
        public ResponseEntity<EmpleadoResponse> updateEmpleado(
                        @Parameter(description = "ID del empleado", required = true, example = "1") @PathVariable Integer id,
                        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Campos a actualizar", required = true) @RequestBody EmpleadoUpdateRequest request) {
                return ResponseEntity.ok(toEmpleadoResponse(empleadoService.update(id, request)));
        }

        @Operation(summary = "Desactivar empleado", description = "Desactiva lógicamente al empleado sin eliminarlo")
        @ApiResponses({
                        @ApiResponse(responseCode = "204", description = "Empleado desactivado", content = @Content),
                        @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
                        @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Empleado no encontrado", content = @Content)
        })
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> desactivarEmpleado(
                        @Parameter(description = "ID del empleado", required = true, example = "1") @PathVariable Integer id) {
                empleadoService.desactivar(id);
                return ResponseEntity.noContent().build();
        }

        // Helpers

        private SectorResponse toSectorResponse(Sector s) {
                return SectorResponse.builder()
                                .identificador(s.getIdentificador())
                                .nombreSector(s.getNombreSector())
                                .codigoSector(s.getCodigoSector())
                                .responsableSectorId(s.getResponsableSector())
                                .responsableSectorNombre(s.getResponsable() != null
                                                ? s.getResponsable().getPersona().getNombre()
                                                : null)
                                .build();
        }

        private EmpleadoResponse toEmpleadoResponse(Empleado e) {
                Persona p = e.getPersona();
                return EmpleadoResponse.builder()
                                .identificador(e.getIdentificador())
                                .nombre(p != null ? p.getNombre() : null)
                                .documento(p != null ? p.getDocumento() : null)
                                .email(p != null && p.getPersonaExtra() != null
                                                ? p.getPersonaExtra().getEmail()
                                                : null)
                                .telefono(p != null && p.getPersonaExtra() != null
                                                ? p.getPersonaExtra().getTelefono()
                                                : null)
                                .cargo(e.getCargo())
                                .estado(p != null && p.getEstado() != null ? p.getEstado().name() : null)
                                .sectorId(e.getSector())
                                .sectorNombre(e.getSectorObj() != null
                                                ? e.getSectorObj().getNombreSector()
                                                : null)
                                .build();
        }
}