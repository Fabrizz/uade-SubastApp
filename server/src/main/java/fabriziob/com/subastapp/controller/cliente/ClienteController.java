package fabriziob.com.subastapp.controller.cliente;

import java.math.BigDecimal;
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

import fabriziob.com.subastapp.entity.Cliente;
import fabriziob.com.subastapp.entity.ClienteExtra;
import fabriziob.com.subastapp.service.ClienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/clientes")
@RequiredArgsConstructor
@Tag(name = "Clientes", description = "Gestión de clientes, estado operativo y medios de pago")
public class ClienteController {

    private static final String R_401 = "No autenticado";
    private static final String R_403 = "Sin permisos para acceder a este recurso";
    private static final String R_404 = "Cliente no encontrado";
    private static final String R_404_MP = "Cliente o medio de pago no encontrado";

    private final ClienteService clienteService;

    @Operation(summary = "Listar clientes", description = "Devuelve todos los clientes paginados")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista paginada de clientes"),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
    })
    @GetMapping
    public ResponseEntity<Page<ClienteResponse>> getAll(
            @PageableDefault(size = 30, sort = "identificador") Pageable pageable) {
        return ResponseEntity.ok(
                clienteService.findAll(pageable).map(this::toResponse));
    }

    @Operation(summary = "Obtener cliente por ID", description = "Devuelve un cliente por su ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cliente encontrado"),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
            @ApiResponse(responseCode = "404", description = R_404, content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(toResponse(clienteService.findById(id)));
    }

    /////////////////////////////////////////////// Estado de usuario
    @Operation(summary = "Admitir cliente", description = "Marca al cliente como admitido para operar en la plataforma")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cliente admitido"),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
            @ApiResponse(responseCode = "404", description = R_404, content = @Content)
    })
    @PatchMapping("/{id}/admitir")
    public ResponseEntity<ClienteResponse> admitir(@PathVariable Integer id) {
        return null;
    }

    @Operation(summary = "Actualizar categoría", description = "Cambia la categoría del cliente (comun, especial, plata, oro, platino)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categoría actualizada"),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
            @ApiResponse(responseCode = "404", description = R_404, content = @Content)
    })
    @PatchMapping("/{id}/categoria")
    public ResponseEntity<ClienteResponse> actualizarCategoria(
            @PathVariable Integer id,
            @RequestParam String categoria) {
        return null;
    }

    @Operation(summary = "Inhabilitar cliente", description = "Inhabilita operativamente al cliente para participar en subastas")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cliente inhabilitado"),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
            @ApiResponse(responseCode = "404", description = R_404, content = @Content)
    })
    @PatchMapping("/{id}/inhabilitar")
    public ResponseEntity<ClienteResponse> inhabilitar(@PathVariable Integer id) {
        return null;
    }

    @Operation(summary = "Habilitar cliente", description = "Habilita operativamente al cliente para participar en subastas")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cliente habilitado"),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
            @ApiResponse(responseCode = "404", description = R_404, content = @Content)
    })
    @PatchMapping("/{id}/habilitar")
    public ResponseEntity<ClienteResponse> habilitar(@PathVariable Integer id) {
        return null;
    }

    @Operation(summary = "Asignar multa", description = "Asigna una multa pendiente al cliente. Inhabilita al cliente hasta que sea saldada")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Multa asignada"),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
            @ApiResponse(responseCode = "404", description = R_404, content = @Content)
    })
    @PatchMapping("/{id}/multa")
    public ResponseEntity<ClienteResponse> asignarMulta(
            @PathVariable Integer id,
            @RequestParam BigDecimal monto) {
        return null;
    }

    /////////////////////////////////////////////// Medios de pago

    @Operation(summary = "Listar medios de pago", description = "Devuelve todos los medios de pago del cliente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de medios de pago"),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
            @ApiResponse(responseCode = "404", description = R_404_MP, content = @Content)
    })
    @GetMapping("/{id}/medios-pago")
    public ResponseEntity<List<MedioPagoResponse>> getMediosPago(
            @PathVariable Integer id) {
        return null;
    }

    @Operation(summary = "Obtener medio de pago", description = "Devuelve un medio de pago específico del cliente por su ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Medio de pago encontrado"),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
            @ApiResponse(responseCode = "404", description = R_404_MP, content = @Content)
    })
    @GetMapping("/{id}/medios-pago/{mpId}")
    public ResponseEntity<MedioPagoResponse> getMedioPago(
            @PathVariable Integer id,
            @PathVariable Integer mpId) {
        return null;
    }

    @Operation(summary = "Agregar cheque", description = "Registra un cheque certificado como medio de pago del cliente")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Cheque registrado"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
            @ApiResponse(responseCode = "404", description = R_404, content = @Content)
    })
    @PostMapping("/{id}/medios-pago/cheque")
    public ResponseEntity<MedioPagoResponse> addCheque(
            @PathVariable Integer id,
            @RequestBody MedioPagoChequeRequest request) {
        return null;
    }

    @Operation(summary = "Agregar cuenta bancaria", description = "Registra una cuenta bancaria (local o exterior) como medio de pago del cliente")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Cuenta registrada"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
            @ApiResponse(responseCode = "404", description = R_404)
    })
    @PostMapping("/{id}/medios-pago/cuenta")
    public ResponseEntity<MedioPagoResponse> addCuenta(
            @PathVariable Integer id,
            @RequestBody MedioPagoCuentaRequest request) {
        return null;
    }

    @Operation(summary = "Agregar tarjeta de crédito", description = "Registra una tarjeta de crédito como medio de pago del cliente")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tarjeta registrada"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
            @ApiResponse(responseCode = "404", description = R_404)
    })
    @PostMapping("/{id}/medios-pago/tarjeta")
    public ResponseEntity<MedioPagoResponse> addTarjeta(
            @PathVariable Integer id,
            @RequestBody MedioPagoTarjetaRequest request) {
        return null;
    }

    @Operation(summary = "Verificar medio de pago", description = "Marca un medio de pago como verificado por la empresa")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Medio de pago verificado"),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
            @ApiResponse(responseCode = "404", description = R_404_MP, content = @Content)
    })
    @PatchMapping("/{id}/medios-pago/{mpId}/verificar")
    public ResponseEntity<MedioPagoResponse> verificar(
            @PathVariable Integer id,
            @PathVariable Integer mpId) {
        return null;
    }

    @Operation(summary = "Desactivar medio de pago", description = "Desactiva un medio de pago, impidiendo su uso en futuras operaciones")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Medio de pago desactivado"),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
            @ApiResponse(responseCode = "404", description = R_404_MP, content = @Content)
    })
    @PatchMapping("/{id}/medios-pago/{mpId}/desactivar")
    public ResponseEntity<MedioPagoResponse> desactivar(
            @PathVariable Integer id,
            @PathVariable Integer mpId) {
        return null;
    }

    @Operation(summary = "Eliminar medio de pago", description = "Elimina definitivamente un medio de pago del cliente")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Medio de pago eliminado", content = @Content),
            @ApiResponse(responseCode = "401", description = R_401, content = @Content),
            @ApiResponse(responseCode = "403", description = R_403, content = @Content),
            @ApiResponse(responseCode = "404", description = R_404_MP, content = @Content)
    })
    @DeleteMapping("/{id}/medios-pago/{mpId}")
    public ResponseEntity<Void> deleteMedioPago(
            @PathVariable Integer id,
            @PathVariable Integer mpId) {
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
