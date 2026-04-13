package fabriziob.com.subastapp.controller.persona;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fabriziob.com.subastapp.entity.Persona;
import fabriziob.com.subastapp.service.PersonaService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/personas")
@RequiredArgsConstructor
public class PersonaController {

    private final PersonaService personaService;

    @GetMapping
    public ResponseEntity<Page<PersonaResponse>> getAll(
            @PageableDefault(size = 30, sort = "identificador") Pageable pageable) {
        return ResponseEntity.ok(
                personaService.findAll(pageable).map(this::toResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonaResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(toResponse(personaService.findById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonaResponse> update(
            @PathVariable Integer id,
            @RequestBody PersonaUpdateRequest request) {
        return null;
    }

    @PutMapping("/{id}/contacto")
    public ResponseEntity<PersonaResponse> updateContacto(
            @PathVariable Integer id,
            @RequestBody ContactoUpdateRequest request) {
        return null;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Integer id) {
        personaService.desactivar(id);
        return ResponseEntity.noContent().build();
    }

    private PersonaResponse toResponse(Persona p) {
        return PersonaResponse.builder()
                .identificador(p.getIdentificador())
                .nombre(p.getNombre())
                .documento(p.getDocumento())
                .direccion(p.getDireccion())
                .estado(p.getEstado() != null ? p.getEstado().name() : null)
                .email(p.getPersonaExtra() != null ? p.getPersonaExtra().getEmail() : null)
                .telefono(p.getPersonaExtra() != null ? p.getPersonaExtra().getTelefono() : null)
                .build();
    }
}