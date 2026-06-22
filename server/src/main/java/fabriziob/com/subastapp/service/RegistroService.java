package fabriziob.com.subastapp.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.controller.subasta.MedioEnvioRequest;
import fabriziob.com.subastapp.controller.subasta.RegistroDeSubastaRequest;
import fabriziob.com.subastapp.controller.subasta.RegistroDeSubastaResponse;
import fabriziob.com.subastapp.entity.Cliente;
import fabriziob.com.subastapp.entity.Duenio;
import fabriziob.com.subastapp.entity.Pais;
import fabriziob.com.subastapp.entity.Producto;
import fabriziob.com.subastapp.entity.RegistroDeSubasta;
import fabriziob.com.subastapp.entity.RegistroDeSubastaExtra;
import fabriziob.com.subastapp.entity.Subasta;
import fabriziob.com.subastapp.entity.enums.EstadoPagoDuenio;
import fabriziob.com.subastapp.entity.enums.MedioEnvio;
import fabriziob.com.subastapp.entity.enums.Moneda;
import fabriziob.com.subastapp.repository.ClienteRepository;
import fabriziob.com.subastapp.repository.DuenioRepository;
import fabriziob.com.subastapp.repository.MedioPagoCuentaRepository;
import fabriziob.com.subastapp.repository.PaisRepository;
import fabriziob.com.subastapp.repository.ProductoRepository;
import fabriziob.com.subastapp.repository.RegistroDeSubastaExtraRepository;
import fabriziob.com.subastapp.repository.RegistroDeSubastaRepository;
import fabriziob.com.subastapp.repository.SubastaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

/**
 * Cierre y post-subasta: registros de venta, estado de pago al dueño, medio de
 * envío y multa por impago. La creación "principal" del registro la hace
 * {@code PujoService.marcarGanador}; {@link #addRegistro} cubre la carga manual
 * (p. ej. el caso "nadie pujó → la empresa compra al valor base").
 */
@Service
@RequiredArgsConstructor
@Transactional
public class RegistroService {

        private static final BigDecimal PORCENTAJE_MULTA = new BigDecimal("0.10");

        private final RegistroDeSubastaRepository registroRepository;
        private final RegistroDeSubastaExtraRepository extraRepository;
        private final SubastaRepository subastaRepository;
        private final DuenioRepository duenioRepository;
        private final ProductoRepository productoRepository;
        private final ClienteRepository clienteRepository;
        private final MedioPagoCuentaRepository cuentaRepository;
        private final PaisRepository paisRepository;
        private final ClienteService clienteService;
        private final NotificacionService notificacionService;

        // ─── lecturas ──────────────────────────────────────────────────────────

        @Transactional(readOnly = true)
        public Page<RegistroDeSubastaResponse> getRegistros(Integer subastaId, Pageable pageable) {
                if (!subastaRepository.existsById(subastaId))
                        throw new EntityNotFoundException("Subasta no encontrada: " + subastaId);

                List<RegistroDeSubastaResponse> all = registroRepository.findBySubastaIdWithAll(subastaId).stream()
                                .map(this::toResponse)
                                .toList();

                int start = (int) pageable.getOffset();
                int end = Math.min(start + pageable.getPageSize(), all.size());
                List<RegistroDeSubastaResponse> content = start <= end && start < all.size()
                                ? all.subList(start, end)
                                : List.of();
                return new PageImpl<>(content, pageable, all.size());
        }

        @Transactional(readOnly = true)
        public RegistroDeSubastaResponse getRegistroById(Integer subastaId, Integer idRegistro) {
                return toResponse(buscarEnSubasta(subastaId, idRegistro));
        }

        // ─── carga manual ────────────────────────────────────────────────────────

        public RegistroDeSubastaResponse addRegistro(Integer subastaId, RegistroDeSubastaRequest req) {
                Subasta subasta = subastaRepository.findById(subastaId)
                                .orElseThrow(() -> new EntityNotFoundException("Subasta no encontrada: " + subastaId));
                Duenio duenio = duenioRepository.findById(req.getDuenioId())
                                .orElseThrow(() -> new EntityNotFoundException("Dueño no encontrado: " + req.getDuenioId()));
                Producto producto = productoRepository.findById(req.getProductoId())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Producto no encontrado: " + req.getProductoId()));
                Cliente cliente = clienteRepository.findById(req.getClienteId())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Cliente no encontrado: " + req.getClienteId()));

                RegistroDeSubasta registro = RegistroDeSubasta.builder()
                                .subasta(subasta)
                                .duenio(duenio)
                                .producto(producto)
                                .cliente(cliente)
                                .importe(req.getImporte())
                                .comision(req.getComision())
                                .build();
                registro = registroRepository.save(registro);

                MedioEnvio medioEnvio = req.getMedioEnvio() != null ? req.getMedioEnvio() : MedioEnvio.RETIRO_DEPOSITO;
                BigDecimal costoEnvio = normalizarCosto(medioEnvio, req.getCostoEnvio());

                RegistroDeSubastaExtra extra = RegistroDeSubastaExtra.builder()
                                .registroSubasta(registro)
                                .cuentaCobroDuenio(req.getCuentaCobroDuenioId() != null
                                                ? cuentaRepository.findById(req.getCuentaCobroDuenioId()).orElse(null)
                                                : null)
                                .direccionEnvio(req.getDireccionEnvio())
                                .paisEnvio(buscarPais(req.getPaisEnvioId()))
                                .medioEnvio(medioEnvio)
                                .costoEnvio(costoEnvio)
                                .importeNeto(calcularNeto(req.getImporte(), req.getComision()))
                                .build();
                extra = extraRepository.save(extra);
                registro.setExtra(extra);

                return toResponse(registro);
        }

        // ─── estado de pago al dueño ───────────────────────────────────────────────

        public RegistroDeSubastaResponse cambiarEstadoPago(Integer subastaId, Integer idRegistro,
                        EstadoPagoDuenio nuevo) {
                RegistroDeSubasta registro = buscarEnSubasta(subastaId, idRegistro);
                RegistroDeSubastaExtra extra = extraDe(registro);

                validarTransicionPago(extra.getEstadoPagoDuenio(), nuevo);
                extra.setEstadoPagoDuenio(nuevo);
                if (nuevo == EstadoPagoDuenio.transferido)
                        extra.setFechaTransferencia(LocalDateTime.now());
                extraRepository.save(extra);

                return toResponse(registro);
        }

        // ─── medio de envío ────────────────────────────────────────────────────────

        public RegistroDeSubastaResponse cambiarMedioEnvio(Integer subastaId, Integer idRegistro,
                        MedioEnvioRequest req) {
                RegistroDeSubasta registro = buscarEnSubasta(subastaId, idRegistro);
                RegistroDeSubastaExtra extra = extraDe(registro);

                MedioEnvio medio = req.getMedioEnvio();
                if (medio == null)
                        throw new IllegalArgumentException("medioEnvio es obligatorio");

                if (medio == MedioEnvio.ENVIO_DOMICILIO) {
                        if (req.getDireccionEnvio() == null || req.getDireccionEnvio().isBlank())
                                throw new IllegalArgumentException(
                                                "direccionEnvio es obligatorio para envío a domicilio");
                        extra.setDireccionEnvio(req.getDireccionEnvio());

                        // Automatically find or default the country
                        Integer paisId = req.getPaisEnvioId();
                        if (paisId == null) {
                                if (registro.getCliente() != null && registro.getCliente().getPais() != null) {
                                        paisId = registro.getCliente().getPais().getNumero();
                                } else {
                                        paisId = 34; // Default to Argentina (from seed-paises)
                                }
                        }
                        extra.setPaisEnvio(buscarPais(paisId));

                        // Calculate the shipping cost: 5 USD or 5000 ARS
                        BigDecimal costo = new BigDecimal("5");
                        if (monedaDe(registro).equals(Moneda.ARS.name())) {
                                costo = new BigDecimal("5000");
                        }
                        extra.setCostoEnvio(costo);
                } else {
                        // Retiro en depósito: sin dirección/país y sin costo de envío.
                        extra.setDireccionEnvio(null);
                        extra.setPaisEnvio(null);
                        extra.setCostoEnvio(BigDecimal.ZERO);
                }

                extra.setMedioEnvio(medio);
                extra.setImporteNeto(calcularNeto(registro.getImporte(), registro.getComision()));
                extraRepository.save(extra);

                notificarFactura(registro, extra);
                return toResponse(registro);
        }

        // ─── multa por impago ──────────────────────────────────────────────────────

        public RegistroDeSubastaResponse marcarImpago(Integer subastaId, Integer idRegistro) {
                RegistroDeSubasta registro = buscarEnSubasta(subastaId, idRegistro);
                Cliente cliente = registro.getCliente();

                BigDecimal multa = registro.getImporte().multiply(PORCENTAJE_MULTA);
                clienteService.asignarMulta(cliente.getIdentificador(), multa);

                notificacionService.notificarCliente(cliente.getIdentificador(),
                                WsNotificacionService.Tipo.warning, "multa",
                                "Multa por impago",
                                "No abonaste la compra de \"" + descripcionProducto(registro)
                                                + "\". Se te aplicó una multa de " + multa
                                                + " (10% del valor ofertado) y tu cuenta quedó suspendida. "
                                                + "Debés presentar los fondos en las próximas 72hs y saldar la multa "
                                                + "antes de poder participar en otra subasta.");

                return toResponse(registro);
        }

        // ─── helpers ───────────────────────────────────────────────────────────────

        private RegistroDeSubasta buscarEnSubasta(Integer subastaId, Integer idRegistro) {
                RegistroDeSubasta registro = registroRepository.findById(idRegistro)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Registro no encontrado: " + idRegistro));
                if (registro.getSubasta() == null
                                || !registro.getSubasta().getIdentificador().equals(subastaId))
                        throw new IllegalArgumentException(
                                        "El registro " + idRegistro + " no pertenece a la subasta " + subastaId);
                return registro;
        }

        private RegistroDeSubastaExtra extraDe(RegistroDeSubasta registro) {
                return extraRepository.findByRegistroSubasta_Identificador(registro.getIdentificador())
                                .orElseThrow(() -> new IllegalStateException(
                                                "El registro " + registro.getIdentificador() + " no tiene datos extra"));
        }

        private Pais buscarPais(Integer paisId) {
                if (paisId == null)
                        return null;
                return paisRepository.findById(paisId)
                                .orElseThrow(() -> new EntityNotFoundException("País no encontrado: " + paisId));
        }

        private void validarTransicionPago(EstadoPagoDuenio actual, EstadoPagoDuenio nuevo) {
                boolean valida = (actual == EstadoPagoDuenio.pendiente && nuevo == EstadoPagoDuenio.transferido)
                                || (actual == EstadoPagoDuenio.transferido && nuevo == EstadoPagoDuenio.confirmado);
                if (!valida)
                        throw new IllegalArgumentException(
                                        "Transición de estado de pago inválida: " + actual + " → " + nuevo
                                                        + " (pendiente → transferido → confirmado)");
        }

        private BigDecimal normalizarCosto(MedioEnvio medio, BigDecimal costo) {
                if (medio == MedioEnvio.RETIRO_DEPOSITO)
                        return BigDecimal.ZERO;
                return costo != null ? costo : BigDecimal.ZERO;
        }

        /** Lo que recibe el dueño: importe − comisión (el envío lo paga el comprador). */
        private BigDecimal calcularNeto(BigDecimal importe, BigDecimal comision) {
                BigDecimal i = importe != null ? importe : BigDecimal.ZERO;
                BigDecimal c = comision != null ? comision : BigDecimal.ZERO;
                return i.subtract(c);
        }

        private void notificarFactura(RegistroDeSubasta registro, RegistroDeSubastaExtra extra) {
                BigDecimal importe = registro.getImporte();
                BigDecimal comision = registro.getComision() != null ? registro.getComision() : BigDecimal.ZERO;
                BigDecimal costoEnvio = extra.getCostoEnvio() != null ? extra.getCostoEnvio() : BigDecimal.ZERO;
                BigDecimal total = importe.add(comision).add(costoEnvio);
                String moneda = monedaDe(registro);

                StringBuilder sb = new StringBuilder();
                sb.append("Detalle de pago por \"").append(descripcionProducto(registro)).append("\": ")
                                .append("pujado ").append(importe)
                                .append(" + comisión ").append(comision)
                                .append(" + envío ").append(costoEnvio)
                                .append(" = total ").append(total).append(" ").append(moneda).append(".");
                if (extra.getMedioEnvio() == MedioEnvio.RETIRO_DEPOSITO)
                                sb.append(" Elegiste retiro en depósito: una vez retirado el bien pierde la cobertura "
                                                + "del seguro.");

                notificacionService.notificarCliente(registro.getCliente().getIdentificador(),
                                WsNotificacionService.Tipo.info, "envio",
                                "Detalle de envío y pago", sb.toString(),
                                "/subastas/" + registro.getSubasta().getIdentificador() + "/registro/" + registro.getIdentificador());
        }

        private String descripcionProducto(RegistroDeSubasta registro) {
                return registro.getProducto() != null ? registro.getProducto().getDescripcionCatalogo() : "";
        }

        private String monedaDe(RegistroDeSubasta registro) {
                Subasta subasta = registro.getSubasta();
                if (subasta != null && subasta.getSubastaExtra() != null
                                && subasta.getSubastaExtra().getMoneda() != null)
                        return subasta.getSubastaExtra().getMoneda().name();
                return Moneda.ARS.name();
        }

        private RegistroDeSubastaResponse toResponse(RegistroDeSubasta r) {
                RegistroDeSubastaExtra extra = r.getExtra();
                Duenio duenio = r.getDuenio();
                Cliente cliente = r.getCliente();
                Pais paisEnvio = extra != null ? extra.getPaisEnvio() : null;

                return RegistroDeSubastaResponse.builder()
                                .identificador(r.getIdentificador())
                                .subastaId(r.getSubasta() != null ? r.getSubasta().getIdentificador() : null)
                                .duenioId(duenio != null ? duenio.getIdentificador() : null)
                                .duenioNombre(duenio != null && duenio.getPersona() != null
                                                ? duenio.getPersona().getNombre()
                                                : null)
                                .productoId(r.getProducto() != null ? r.getProducto().getIdentificador() : null)
                                .productoDescripcion(r.getProducto() != null
                                                ? r.getProducto().getDescripcionCatalogo()
                                                : null)
                                .clienteId(cliente != null ? cliente.getIdentificador() : null)
                                .clienteNombre(cliente != null && cliente.getPersona() != null
                                                ? cliente.getPersona().getNombre()
                                                : null)
                                .importe(r.getImporte())
                                .comision(r.getComision())
                                .extraId(extra != null ? extra.getIdentificador() : null)
                                .cuentaCobroDuenioId(extra != null && extra.getCuentaCobroDuenio() != null
                                                ? extra.getCuentaCobroDuenio().getIdentificador()
                                                : null)
                                .direccionEnvio(extra != null ? extra.getDireccionEnvio() : null)
                                .paisEnvioId(paisEnvio != null ? paisEnvio.getNumero() : null)
                                .paisEnvioNombre(paisEnvio != null ? paisEnvio.getNombre() : null)
                                .estadoPagoDuenio(extra != null ? extra.getEstadoPagoDuenio() : null)
                                .fechaTransferencia(extra != null ? extra.getFechaTransferencia() : null)
                                .importeNeto(extra != null ? extra.getImporteNeto() : null)
                                .costoEnvio(extra != null ? extra.getCostoEnvio() : null)
                                .medioEnvio(extra != null ? extra.getMedioEnvio() : null)
                                .moneda(monedaDe(r))
                                .build();
        }
}
