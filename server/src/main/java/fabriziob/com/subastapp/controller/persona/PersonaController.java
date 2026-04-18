package fabriziob.com.subastapp.controller.persona;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/personas")
@RequiredArgsConstructor
@Tag(name = "Personas", description = "Gestión de personas, contacto y foto de perfil")
public class PersonaController {

    private final PersonaService personaService;

    @Operation(summary = "Listar personas", description = "Devuelve todas las personas paginadas")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista paginada de personas")
    })
    @GetMapping
    public ResponseEntity<Page<PersonaResponse>> getAll(
            @PageableDefault(size = 30, sort = "identificador") Pageable pageable) {
        return ResponseEntity.ok(personaService.findAll(pageable).map(this::toResponse));
    }

    @Operation(summary = "Obtener persona por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Persona encontrada"),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Persona no encontrada", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<PersonaResponse> getById(
            @Parameter(description = "ID de la persona", required = true, example = "1") @PathVariable Integer id) {
        return ResponseEntity.ok(toResponse(personaService.findById(id)));
    }

    @Operation(summary = "Actualizar persona", description = "Reemplaza los datos personales de una persona")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Persona actualizada"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Persona no encontrada", content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<PersonaResponse> update(
            @Parameter(description = "ID de la persona", required = true, example = "1") @PathVariable Integer id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Nuevos datos de la persona", required = true) @RequestBody PersonaUpdateRequest request) {
        return null;
    }

    @Operation(summary = "Actualizar contacto", description = "Actualiza el email y teléfono de una persona")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Contacto actualizado"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Persona no encontrada", content = @Content)
    })
    @PutMapping("/{id}/contacto")
    public ResponseEntity<PersonaResponse> updateContacto(
            @Parameter(description = "ID de la persona", required = true, example = "1") @PathVariable Integer id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Nuevos datos de contacto", required = true) @RequestBody ContactoUpdateRequest request) {
        return null;
    }

    @Operation(summary = "Desactivar persona", description = "Desactiva lógicamente a una persona, sin eliminarla de la base de datos")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Persona desactivada", content = @Content),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Persona no encontrada", content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(
            @Parameter(description = "ID de la persona", required = true, example = "1") @PathVariable Integer id) {
        personaService.desactivar(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Obtener foto de perfil", description = "Devuelve el contenido binario de la foto. El Content-Type se detecta automáticamente (PNG, JPEG o WEBP)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Imagen encontrada", content = {
                    @Content(mediaType = MediaType.IMAGE_PNG_VALUE),
                    @Content(mediaType = MediaType.IMAGE_JPEG_VALUE),
                    @Content(mediaType = "image/webp")
            }),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Persona o foto no encontrada", content = @Content)
    })
    @GetMapping(value = "/{id}/foto/content", produces = {
            MediaType.IMAGE_PNG_VALUE,
            MediaType.IMAGE_JPEG_VALUE,
            "image/webp"
    })
    public ResponseEntity<byte[]> fotoContent(
            @Parameter(description = "ID de la persona", required = true, example = "1") @PathVariable Integer id) {
        return null;
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