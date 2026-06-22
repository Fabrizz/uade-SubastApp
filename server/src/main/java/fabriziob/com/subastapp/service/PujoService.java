package fabriziob.com.subastapp.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.controller.subasta.MarcarGanadorRequest;
import fabriziob.com.subastapp.controller.subasta.PujoRequest;
import fabriziob.com.subastapp.controller.subasta.PujoResponse;
import fabriziob.com.subastapp.controller.subasta.SubastaEventoResponse;
import fabriziob.com.subastapp.controller.subasta.SubastaEventoResponse;
import fabriziob.com.subastapp.entity.Asistente;
import fabriziob.com.subastapp.entity.Catalogo;
import fabriziob.com.subastapp.entity.Cliente;
import fabriziob.com.subastapp.entity.ClienteExtra;
import fabriziob.com.subastapp.entity.ItemCatalogo;
import fabriziob.com.subastapp.entity.MedioPago;
import fabriziob.com.subastapp.entity.MedioPagoCheque;
import fabriziob.com.subastapp.entity.Pujo;
import fabriziob.com.subastapp.entity.RegistroDeSubasta;
import fabriziob.com.subastapp.entity.RegistroDeSubastaExtra;
import fabriziob.com.subastapp.entity.Subasta;
import fabriziob.com.subastapp.entity.enums.CategoriaSubasta;
import fabriziob.com.subastapp.entity.enums.EstadoDetalladoSubasta;
import fabriziob.com.subastapp.entity.enums.EstadoSubasta;
import fabriziob.com.subastapp.entity.enums.Moneda;
import fabriziob.com.subastapp.entity.enums.TipoMedioPago;
import fabriziob.com.subastapp.repository.AsistenteRepository;
import fabriziob.com.subastapp.repository.ClienteRepository;
import fabriziob.com.subastapp.repository.ItemCatalogoRepository;
import fabriziob.com.subastapp.repository.MedioPagoChequeRepository;
import fabriziob.com.subastapp.repository.MedioPagoCuentaRepository;
import fabriziob.com.subastapp.repository.MedioPagoRepository;
import fabriziob.com.subastapp.repository.MedioPagoTarjetaRepository;
import fabriziob.com.subastapp.repository.PujoRepository;
import fabriziob.com.subastapp.repository.RegistroDeSubastaExtraRepository;
import fabriziob.com.subastapp.repository.RegistroDeSubastaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PujoService {

        private final PujoRepository pujoRepository;
        private final AsistenteRepository asistenteRepository;
        private final ItemCatalogoRepository itemRepository;
        private final MedioPagoRepository medioPagoRepository;
        private final MedioPagoChequeRepository chequeRepository;
        private final MedioPagoCuentaRepository cuentaRepository;
        private final MedioPagoTarjetaRepository tarjetaRepository;
        private final RegistroDeSubastaRepository registroRepository;
        private final RegistroDeSubastaExtraRepository registroExtraRepository;
        private final ClienteRepository clienteRepository;
        private final SimpMessagingTemplate messagingTemplate;
        private final NotificacionService notificacionService;

        private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PujoService.class);

        // ─── crear pujo ─────────────────────────────────────────────────────────

        public PujoResponse crearPujo(Integer subastaId, Integer itemId, PujoRequest req) {
                Asistente asistente = asistenteRepository.findById(req.getAsistenteId())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Asistente no encontrado: " + req.getAsistenteId()));

                Subasta subasta = asistente.getSubasta();
                if (subasta == null || !subasta.getIdentificador().equals(subastaId))
                        throw new IllegalArgumentException(
                                        "El asistente no pertenece a la subasta " + subastaId);

                if (subasta.getEstado() != EstadoSubasta.abierta)
                        throw new IllegalStateException("La subasta no está abierta");

                // Gating por estado detallado: la subasta debe estar en curso.
                if (subasta.getSubastaExtra() == null || subasta.getSubastaExtra().getEstadoDetallado() != EstadoDetalladoSubasta.en_curso) {
                        throw new IllegalStateException("La subasta no está en curso");
                }

                ItemCatalogo item = itemRepository.findById(itemId)
                                .orElseThrow(() -> new EntityNotFoundException("Item no encontrado: " + itemId));

                Catalogo catalogo = item.getCatalogo();
                if (catalogo == null || catalogo.getSubasta() == null
                                || !catalogo.getSubasta().getIdentificador().equals(subastaId))
                        throw new IllegalArgumentException(
                                        "El item " + itemId + " no pertenece a la subasta " + subastaId);

                if (!pujoRepository.findByItem_IdentificadorAndGanador(itemId, "si").isEmpty())
                        throw new IllegalStateException("El item ya tiene un ganador");

                Cliente cliente = asistente.getCliente();

                // Un dueño no debería poder pujar por su propio artículo
                if (item.getProducto() != null && item.getProducto().getDuenio() != null) {
                        if (cliente.getIdentificador().equals(item.getProducto().getDuenio().getIdentificador())) {
                                throw new IllegalArgumentException("No puedes pujar por tu propio artículo");
                        }
                }

                // (#11) Guard cliente operativo
                validarClienteOperativo(cliente);

                Moneda monedaSubasta = subasta.getSubastaExtra() != null
                                ? subasta.getSubastaExtra().getMoneda()
                                : Moneda.ARS;

                // (#1 + #2 + #5) Guard medio de pago válido
                List<MedioPago> mediosValidos = mediosValidosParaPujar(cliente.getIdentificador(),
                                monedaSubasta, subasta.getFecha());
                if (mediosValidos.isEmpty())
                        throw new SecurityException(
                                        "No tiene un medio de pago verificado y compatible con la moneda de la subasta");

                // (#3) Guard garantía solo-cheque
                boolean soloCheques = mediosValidos.stream()
                                .allMatch(mp -> mp.getTipo() == TipoMedioPago.cheque);
                if (soloCheques) {
                        validarGarantiaCheque(cliente.getIdentificador(), monedaSubasta,
                                        subasta.getFecha(), req.getImporte());
                }

                // Regla +1% / +20% sobre precio base (no aplica a oro/platino)
                validarRangoPuje(req.getImporte(), item, subasta);

                // El nuevo importe debe ser mayor al mejor pujo actual
                Optional<Pujo> pujoAnterior = pujoRepository.findTopByItem_IdentificadorOrderByImporteDesc(itemId);
                BigDecimal mejorActual = pujoAnterior.map(Pujo::getImporte).orElse(BigDecimal.ZERO);
                if (req.getImporte().compareTo(mejorActual) <= 0)
                        throw new IllegalArgumentException(
                                        "El importe debe ser mayor al mejor pujo actual: " + mejorActual);

                Pujo nuevo = Pujo.builder()
                                .asistente(asistente)
                                .item(item)
                                .importe(req.getImporte())
                                .ganador("no")
                                .build();
                nuevo = pujoRepository.save(nuevo);

                PujoResponse response = toResponse(nuevo);
                messagingTemplate.convertAndSend("/topic/subastas/" + subastaId + "/pujas", response);

                // Avisar al postor anterior que fue superado (si no es el mismo cliente)
                pujoAnterior.ifPresent(anterior -> {
                        Cliente clienteAnterior = anterior.getAsistente() != null
                                        ? anterior.getAsistente().getCliente()
                                        : null;
                        if (clienteAnterior != null
                                        && !clienteAnterior.getIdentificador().equals(cliente.getIdentificador())) {
                                notificacionService.notificarCliente(clienteAnterior.getIdentificador(),
                                                WsNotificacionService.Tipo.pujo_update, "puja",
                                                "Te superaron en una puja",
                                                "Tu puja de " + anterior.getImporte() + " por \""
                                                                + (item.getProducto() != null
                                                                                ? item.getProducto().getDescripcionCatalogo()
                                                                                : "un ítem")
                                                                + "\" fue superada por " + req.getImporte() + ".");
                        }
                });

                return response;
        }

        // ─── marcar ganador ─────────────────────────────────────────────────────

        public PujoResponse marcarGanador(Integer subastaId, Integer itemId, Integer pujoId,
                        MarcarGanadorRequest req) {
                Pujo pujo = pujoRepository.findById(pujoId)
                                .orElseThrow(() -> new EntityNotFoundException("Pujo no encontrado: " + pujoId));

                if (pujo.getItem() == null || !pujo.getItem().getIdentificador().equals(itemId))
                        throw new IllegalArgumentException("El pujo no pertenece al item " + itemId);

                ItemCatalogo item = pujo.getItem();
                Catalogo catalogo = item.getCatalogo();
                if (catalogo == null || catalogo.getSubasta() == null
                                || !catalogo.getSubasta().getIdentificador().equals(subastaId))
                        throw new IllegalArgumentException("El pujo no pertenece a la subasta " + subastaId);

                if (!pujoRepository.findByItem_IdentificadorAndGanador(itemId, "si").isEmpty())
                        throw new IllegalStateException("El item ya tiene un ganador");

                Subasta subasta = catalogo.getSubasta();
                Cliente cliente = pujo.getAsistente().getCliente();

                MedioPago medio = medioPagoRepository.findById(req.getMedioPagoCompradorId())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Medio de pago no encontrado: " + req.getMedioPagoCompradorId()));

                if (!medio.getCliente().equals(cliente.getIdentificador()))
                        throw new IllegalArgumentException(
                                        "El medio de pago no pertenece al cliente ganador");

                Moneda monedaSubasta = subasta.getSubastaExtra() != null
                                ? subasta.getSubastaExtra().getMoneda()
                                : Moneda.ARS;

                if (!Boolean.TRUE.equals(medio.getVerificado())
                                || !Boolean.TRUE.equals(medio.getActivo())
                                || medio.getMoneda() != monedaSubasta)
                        throw new IllegalArgumentException(
                                        "El medio de pago no es válido (verificado/activo/moneda)");

                if (!medioCompatibleConMoneda(medio, monedaSubasta, subasta.getFecha()))
                        throw new IllegalArgumentException(
                                        "El medio de pago no cumple los requisitos para la moneda de la subasta");

                if (medio.getTipo() == TipoMedioPago.cheque) {
                        validarGarantiaCheque(cliente.getIdentificador(), monedaSubasta,
                                        subasta.getFecha(), pujo.getImporte());
                }

                pujo.setGanador("si");
                pujoRepository.save(pujo);

                item.setSubastado("si");
                itemRepository.save(item);

                RegistroDeSubasta registro = RegistroDeSubasta.builder()
                                .subasta(subasta)
                                .duenio(item.getProducto().getDuenio())
                                .producto(item.getProducto())
                                .cliente(cliente)
                                .importe(pujo.getImporte())
                                .comision(item.getComision())
                                .build();
                registro = registroRepository.save(registro);

                RegistroDeSubastaExtra extra = RegistroDeSubastaExtra.builder()
                                .registroSubasta(registro)
                                .medioPagoComprador(medio)
                                .build();
                registroExtraRepository.save(extra);

                PujoResponse response = toResponse(pujo);
                messagingTemplate.convertAndSend("/topic/subastas/" + subastaId + "/ganadores", response);

                // Avance de ítem: el ítem quedó subastado → señal liviana para que los
                // clientes refetcheen el catálogo y re-deriven el ítem actual.
                messagingTemplate.convertAndSend("/topic/subastas/" + subastaId,
                                SubastaEventoResponse.builder()
                                                .tipo("ITEM_SUBASTADO")
                                                .subastaId(subastaId)
                                                .itemId(itemId)
                                                .build());

                // Mensaje privado al ganador con el detalle de pago (lo pujado +
                // comisiones). El costo de envío se define luego al elegir el medio de
                // envío (PATCH .../medio-envio), que reenvía la factura completa.
                notificacionService.notificarCliente(cliente.getIdentificador(),
                                WsNotificacionService.Tipo.success, "pago",
                                "¡Ganaste la subasta!",
                                "Te adjudicaste \"" + item.getProducto().getDescripcionCatalogo()
                                                + "\". Debés abonar el monto de tu puja de " + pujo.getImporte()
                                                + " " + monedaSubasta.name()
                                                + " (más el costo de envío a definir según el medio de envío que elijas).",
                                "/subastas/" + subastaId + "/registro/" + registro.getIdentificador());
                return response;
        }

        // ─── listados ───────────────────────────────────────────────────────────

        @Transactional(readOnly = true)
        public List<PujoResponse> listarPorSubasta(Integer subastaId) {
                return pujoRepository.findBySubastaIdWithAll(subastaId).stream()
                                .map(this::toResponse)
                                .toList();
        }

        @Transactional(readOnly = true)
        public List<PujoResponse> listarPorItem(Integer subastaId, Integer itemId) {
                return pujoRepository.findBySubastaIdAndItemId(subastaId, itemId).stream()
                                .map(this::toResponse)
                                .toList();
        }

        // ─── helpers ────────────────────────────────────────────────────────────

        private void validarClienteOperativo(Cliente cliente) {
                ClienteExtra extra = cliente.getClienteExtra();
                if (extra == null)
                        throw new SecurityException("Cliente sin estado operativo");
                if (Boolean.TRUE.equals(extra.getInadmitido()))
                        throw new SecurityException(
                                        "Cliente no habilitado para pujar (estado: inadmitido)");
                if (!"habilitado".equals(extra.getEstadoOperativo()))
                        throw new SecurityException(
                                        "Cliente no habilitado para pujar (estado: " + extra.getEstadoOperativo()
                                                        + ")");
                if (extra.getMultaPendiente() != null
                                && extra.getMultaPendiente().compareTo(BigDecimal.ZERO) > 0)
                        throw new SecurityException("Cliente con multa pendiente, no puede pujar");
        }

        private List<MedioPago> mediosValidosParaPujar(Integer clienteId, Moneda moneda,
                        LocalDate fechaSubasta) {
                return medioPagoRepository
                                .findByClienteAndVerificadoTrueAndActivoTrueAndMoneda(clienteId, moneda)
                                .stream()
                                .filter(mp -> medioCompatibleConMoneda(mp, moneda, fechaSubasta))
                                .toList();
        }

        private boolean medioCompatibleConMoneda(MedioPago mp, Moneda moneda, LocalDate fechaSubasta) {
                return switch (mp.getTipo()) {
                        case tarjeta_credito -> moneda == Moneda.ARS || esTarjetaInternacional(mp.getIdentificador());
                        case cuenta_bancaria -> moneda == Moneda.ARS || esCuentaExterior(mp.getIdentificador());
                        case cheque -> moneda == Moneda.ARS && chequeVigente(mp.getIdentificador(), fechaSubasta);
                };
        }

        private boolean esTarjetaInternacional(Integer mpId) {
                return tarjetaRepository.findById(mpId)
                                .map(t -> Boolean.TRUE.equals(t.getEsInternacional()))
                                .orElse(false);
        }

        private boolean esCuentaExterior(Integer mpId) {
                return cuentaRepository.findById(mpId)
                                .map(c -> Boolean.TRUE.equals(c.getEsExterior()))
                                .orElse(false);
        }

        private boolean chequeVigente(Integer mpId, LocalDate fechaSubasta) {
                return chequeRepository.findById(mpId)
                                .map(c -> fechaSubasta == null
                                                || !c.getFechaVencimiento().isBefore(fechaSubasta))
                                .orElse(false);
        }

        private void validarGarantiaCheque(Integer clienteId, Moneda moneda,
                        LocalDate fechaSubasta, BigDecimal importeNuevo) {
                List<MedioPagoCheque> vigentes = chequeRepository
                                .findVigentesByCliente(clienteId, moneda, fechaSubasta);
                BigDecimal cap = vigentes.stream()
                                .map(MedioPagoCheque::getMontoCertificado)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal consumido = Optional.ofNullable(
                                pujoRepository.sumImporteGanadorPendienteByCliente(clienteId, moneda))
                                .orElse(BigDecimal.ZERO);

                BigDecimal disponible = cap.subtract(consumido);
                if (importeNuevo.compareTo(disponible) > 0)
                        throw new IllegalStateException(
                                        "Garantía insuficiente: disponible " + disponible
                                                        + " " + moneda + ", pujo solicitado " + importeNuevo);
        }

        private void validarRangoPuje(BigDecimal importe, ItemCatalogo item, Subasta subasta) {
                CategoriaSubasta categoria = subasta.getCategoria();
                if (categoria == CategoriaSubasta.oro || categoria == CategoriaSubasta.platino)
                        return;

                BigDecimal precioBase = item.getPrecioBase();
                BigDecimal mejorActual = pujoRepository.findMaxImporteByItem(item.getIdentificador())
                                .orElse(precioBase);
                BigDecimal minimo = mejorActual.add(precioBase.multiply(new BigDecimal("0.01")));
                BigDecimal maximo = mejorActual.add(precioBase.multiply(new BigDecimal("0.20")));

                if (importe.compareTo(minimo) < 0)
                        throw new IllegalArgumentException(
                                        "El importe mínimo permitido es " + minimo
                                                        + " (mejorActual + 1% del precio base)");
                if (importe.compareTo(maximo) > 0)
                        throw new IllegalArgumentException(
                                        "El importe máximo permitido es " + maximo
                                                        + " (mejorActual + 20% del precio base)");
        }

        // ─── cierre automático por scheduler ────────────────────────────────────

        @Transactional
        public void cerrarItemAutomatico(Subasta subasta, ItemCatalogo item) {
                Optional<Pujo> mejorPujo = pujoRepository
                                .findTopByItem_IdentificadorOrderByImporteDesc(item.getIdentificador());

                item.setSubastado("si");
                itemRepository.save(item);

                if (mejorPujo.isPresent()) {
                        Pujo pujo = mejorPujo.get();
                        pujo.setGanador("si");
                        pujoRepository.save(pujo);

                        Cliente cliente = pujo.getAsistente().getCliente();
                        Moneda monedaSubasta = subasta.getSubastaExtra() != null
                                        ? subasta.getSubastaExtra().getMoneda()
                                        : Moneda.ARS;

                        List<MedioPago> mediosValidos = mediosValidosParaPujar(
                                        cliente.getIdentificador(), monedaSubasta, subasta.getFecha());
                        MedioPago medio = mediosValidos.stream()
                                        .filter(mp -> {
                                                if (mp.getTipo() != TipoMedioPago.cheque) return true;
                                                return chequeRepository.findById(mp.getIdentificador())
                                                                .map(c -> pujo.getImporte().compareTo(c.getMontoCertificado()) <= 0)
                                                                .orElse(false);
                                        })
                                        .findFirst()
                                        .orElse(null);

                        RegistroDeSubasta registro = RegistroDeSubasta.builder()
                                        .subasta(subasta)
                                        .duenio(item.getProducto().getDuenio())
                                        .producto(item.getProducto())
                                        .cliente(cliente)
                                        .importe(pujo.getImporte())
                                        .comision(item.getComision() != null ? item.getComision() : BigDecimal.ZERO)
                                        .build();
                        registro = registroRepository.save(registro);

                        RegistroDeSubastaExtra registroExtra = RegistroDeSubastaExtra.builder()
                                        .registroSubasta(registro)
                                        .medioPagoComprador(medio)
                                        .build();
                        registroExtraRepository.save(registroExtra);

                        messagingTemplate.convertAndSend(
                                        "/topic/subastas/" + subasta.getIdentificador() + "/ganadores",
                                        toResponse(pujo));

                        String descripcion = item.getProducto() != null
                                        ? item.getProducto().getDescripcionCatalogo()
                                        : "un ítem";
                        notificacionService.notificarCliente(cliente.getIdentificador(),
                                        WsNotificacionService.Tipo.success, "pago",
                                        "¡Ganaste la subasta!",
                                        "Te adjudicaste \"" + descripcion + "\". Debés abonar el monto de tu puja de "
                                                        + pujo.getImporte() + " " + monedaSubasta.name()
                                                        + " (más el costo de envío a definir).",
                                        "/subastas/" + subasta.getIdentificador() + "/registro/" + registro.getIdentificador());
                } else {
                        // NO ONE BID -> Company buys at base value and keeps it in the warehouse
                        Cliente clienteEmpresa = clienteRepository.findAll().stream()
                                        .filter(c -> c.getCategoria() == fabriziob.com.subastapp.entity.enums.ClienteCategoria.admin)
                                        .findFirst()
                                        .orElse(null);

                        if (clienteEmpresa == null) {
                                clienteEmpresa = clienteRepository.findAll().stream()
                                                .findFirst()
                                                .orElse(null);
                        }

                        if (clienteEmpresa != null) {
                                BigDecimal basePrice = item.getPrecioBase() != null ? item.getPrecioBase() : BigDecimal.ZERO;
                                RegistroDeSubasta registro = RegistroDeSubasta.builder()
                                                .subasta(subasta)
                                                .duenio(item.getProducto().getDuenio())
                                                .producto(item.getProducto())
                                                .cliente(clienteEmpresa)
                                                .importe(basePrice)
                                                .comision(BigDecimal.ZERO)
                                                .build();
                                registro = registroRepository.save(registro);

                                RegistroDeSubastaExtra registroExtra = RegistroDeSubastaExtra.builder()
                                                .registroSubasta(registro)
                                                .medioEnvio(fabriziob.com.subastapp.entity.enums.MedioEnvio.RETIRO_DEPOSITO)
                                                .costoEnvio(BigDecimal.ZERO)
                                                .direccionEnvio(null)
                                                .paisEnvio(null)
                                                .build();
                                registroExtraRepository.save(registroExtra);

                                if (item.getProducto() != null && item.getProducto().getProductoExtra() != null) {
                                        item.getProducto().getProductoExtra().setDeposito("Almacén");
                                }

                                log.info("Subasta {} - Item {} sin pujas. Autocomprado por la empresa (Cliente ID: {}) al valor base: {}",
                                                subasta.getIdentificador(), item.getIdentificador(), clienteEmpresa.getIdentificador(), basePrice);

                                // Notify the original owner that the company bought the item
                                if (item.getProducto().getDuenio() != null) {
                                        String descripcion = item.getProducto().getDescripcionCatalogo();
                                        notificacionService.notificarCliente(
                                                        item.getProducto().getDuenio().getIdentificador(),
                                                        WsNotificacionService.Tipo.success,
                                                        "subasta",
                                                        "Artículo comprado por la empresa",
                                                        "Tu artículo \"" + descripcion + "\" no recibió ofertas en la subasta y fue adquirido automáticamente por la empresa al valor base de " 
                                                                        + basePrice + " " + (subasta.getSubastaExtra() != null ? subasta.getSubastaExtra().getMoneda().name() : "ARS") + ".");
                                }
                        } else {
                                log.warn("No se pudo autocomprar el Item {} porque no hay ningún cliente registrado en el sistema.", item.getIdentificador());
                        }
                }

                messagingTemplate.convertAndSend("/topic/subastas/" + subasta.getIdentificador(),
                                SubastaEventoResponse.builder()
                                                .tipo("ITEM_SUBASTADO")
                                                .subastaId(subasta.getIdentificador())
                                                .itemId(item.getIdentificador())
                                                .build());
        }

        // ────────────────────────────────────────────────────────────────────────

        private PujoResponse toResponse(Pujo p) {
                Cliente c = p.getAsistente() != null ? p.getAsistente().getCliente() : null;
                return PujoResponse.builder()
                                .identificador(p.getIdentificador())
                                .asistenteId(p.getAsistente() != null ? p.getAsistente().getIdentificador() : null)
                                .clienteId(c != null ? c.getIdentificador() : null)
                                .clienteNombre(c != null && c.getPersona() != null ? c.getPersona().getNombre() : null)
                                .numeroPostor(p.getAsistente() != null ? p.getAsistente().getNumeroPostor() : null)
                                .itemId(p.getItem() != null ? p.getItem().getIdentificador() : null)
                                .productoDescripcion(p.getItem() != null && p.getItem().getProducto() != null
                                                ? p.getItem().getProducto().getDescripcionCatalogo()
                                                : null)
                                .importe(p.getImporte())
                                .ganador(p.getGanador())
                                .build();
        }
}
