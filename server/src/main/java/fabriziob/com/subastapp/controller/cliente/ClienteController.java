package fabriziob.com.subastapp.controller.cliente;

import java.math.BigDecimal;

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

import fabriziob.com.subastapp.entity.Cliente;
import fabriziob.com.subastapp.entity.ClienteExtra;
import fabriziob.com.subastapp.service.ClienteService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    public ResponseEntity<Page<ClienteResponse>> getAll(
            @PageableDefault(size = 30, sort = "identificador") Pageable pageable) {
        return ResponseEntity.ok(
                clienteService.findAll(pageable).map(this::toResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(toResponse(clienteService.findById(id)));
    }

    // TODO: /{id}/admitir
    @PatchMapping("/{id}/admitir")
    public ResponseEntity<ClienteResponse> admitir(@PathVariable Integer id) {
        return null;
    }

    // TODO: /{id}/rechazar
    @PatchMapping("/{id}/categoria")
    public ResponseEntity<ClienteResponse> actualizarCategoria(
            @PathVariable Integer id,
            @RequestParam String categoria) {
        return null;
    }

    // TODO: /{id}/habilitar
    @PatchMapping("/{id}/habilitar")
    public ResponseEntity<ClienteResponse> habilitar(@PathVariable Integer id) {
        return null;
    }

    // TODO: /{id}/inhabilitar
    @PatchMapping("/{id}/inhabilitar")
    public ResponseEntity<ClienteResponse> inhabilitar(@PathVariable Integer id) {
        return null;
    }

    // TODO: /{id}/multa?monto=1000
    @PatchMapping("/{id}/multa")
    public ResponseEntity<ClienteResponse> asignarMulta(
            @PathVariable Integer id,
            @RequestParam BigDecimal monto) {
        return null;
    }

    private ClienteResponse toResponse(Cliente c) {
        ClienteExtra extra = c.getClienteExtra();
        return ClienteResponse.builder()
                .identificador(c.getIdentificador())
                .nombre(c.getPersona() != null ? c.getPersona().getNombre() : null)
                .email(c.getPersona() != null && c.getPersona().getPersonaExtra() != null
                        ? c.getPersona().getPersonaExtra().getEmail()
                        : null)
                .admitido(c.getAdmitido())
                .categoria(c.getCategoria())
                .estadoOperativo(extra != null ? extra.getEstadoOperativo() : null)
                .multaPendiente(extra != null ? extra.getMultaPendiente() : null)
                .pais(c.getPais() != null ? c.getPais().getNombre() : null)
                .build();
    }
}
