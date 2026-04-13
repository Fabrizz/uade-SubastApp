package fabriziob.com.subastapp.controller.empleado;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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
import fabriziob.com.subastapp.service.EmpleadoService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/empleados")
@RequiredArgsConstructor
public class EmpleadoController {

    private final EmpleadoService empleadoService;

    @GetMapping
    public ResponseEntity<Page<EmpleadoResponse>> getAll(
            @PageableDefault(size = 20, sort = "identificador") Pageable pageable) {
        return ResponseEntity.ok(
                empleadoService.findAll(pageable).map(this::toResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpleadoResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(toResponse(empleadoService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<EmpleadoResponse> create(@RequestBody EmpleadoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(empleadoService.create(request)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<EmpleadoResponse> update(
            @PathVariable Integer id,
            @RequestBody EmpleadoUpdateRequest request) {
        return ResponseEntity.ok(toResponse(empleadoService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Integer id) {
        empleadoService.desactivar(id);
        return ResponseEntity.noContent().build();
    }

    private EmpleadoResponse toResponse(Empleado e) {
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