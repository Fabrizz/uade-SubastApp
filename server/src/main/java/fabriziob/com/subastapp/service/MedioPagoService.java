package fabriziob.com.subastapp.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.controller.cliente.MedioPagoChequeDetail;
import fabriziob.com.subastapp.controller.cliente.MedioPagoChequeRequest;
import fabriziob.com.subastapp.controller.cliente.MedioPagoCuentaDetail;
import fabriziob.com.subastapp.controller.cliente.MedioPagoCuentaRequest;
import fabriziob.com.subastapp.controller.cliente.MedioPagoResponse;
import fabriziob.com.subastapp.controller.cliente.MedioPagoTarjetaDetail;
import fabriziob.com.subastapp.controller.cliente.MedioPagoTarjetaRequest;
import fabriziob.com.subastapp.entity.MedioPago;
import fabriziob.com.subastapp.entity.MedioPagoCheque;
import fabriziob.com.subastapp.entity.MedioPagoCuenta;
import fabriziob.com.subastapp.entity.MedioPagoTarjeta;
import fabriziob.com.subastapp.entity.enums.Moneda;
import fabriziob.com.subastapp.entity.enums.TipoMedioPago;
import fabriziob.com.subastapp.repository.ClienteRepository;
import fabriziob.com.subastapp.repository.MedioPagoChequeRepository;
import fabriziob.com.subastapp.repository.MedioPagoCuentaRepository;
import fabriziob.com.subastapp.repository.MedioPagoRepository;
import fabriziob.com.subastapp.repository.MedioPagoTarjetaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MedioPagoService {

    private final ClienteRepository clienteRepository;
    private final MedioPagoRepository medioPagoRepository;
    private final MedioPagoChequeRepository chequeRepository;
    private final MedioPagoCuentaRepository cuentaRepository;
    private final MedioPagoTarjetaRepository tarjetaRepository;
    private final CategoriaService categoriaService;

    @Transactional(readOnly = true)
    public List<MedioPagoResponse> listar(Integer clienteId) {
        validarCliente(clienteId);
        return medioPagoRepository.findByCliente(clienteId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MedioPagoResponse obtener(Integer clienteId, Integer mpId) {
        return toResponse(getDelCliente(clienteId, mpId));
    }

    public MedioPagoResponse agregarCheque(Integer clienteId, MedioPagoChequeRequest req) {
        MedioPago base = crearBase(clienteId, TipoMedioPago.cheque, req.getMoneda());

        MedioPagoCheque cheque = MedioPagoCheque.builder()
                .medioPago(base)
                .nroCheque(req.getNroCheque())
                .banco(req.getBanco())
                .montoCertificado(req.getMontoCertificado())
                .fechaVencimiento(req.getFechaVencimiento())
                .build();
        chequeRepository.save(cheque);

        return toResponse(base);
    }

    public MedioPagoResponse agregarCuenta(Integer clienteId, MedioPagoCuentaRequest req) {
        MedioPago base = crearBase(clienteId, TipoMedioPago.cuenta_bancaria, req.getMoneda());

        MedioPagoCuenta cuenta = MedioPagoCuenta.builder()
                .medioPago(base)
                .titular(req.getTitular())
                .banco(req.getBanco())
                .cbu(req.getCbu())
                .alias(req.getAlias())
                .esExterior(Boolean.TRUE.equals(req.getEsExterior()))
                .iban(req.getIban())
                .pais(req.getPais())
                .tipoDeCuenta(req.getTipoDeCuenta())
                .build();
        cuentaRepository.save(cuenta);

        return toResponse(base);
    }

    public MedioPagoResponse agregarTarjeta(Integer clienteId, MedioPagoTarjetaRequest req) {
        MedioPago base = crearBase(clienteId, TipoMedioPago.tarjeta_credito, req.getMoneda());

        MedioPagoTarjeta tarjeta = MedioPagoTarjeta.builder()
                .medioPago(base)
                .titular(req.getTitular())
                .ultimos4(req.getUltimos4())
                .marca(req.getMarca())
                .vencimiento(req.getVencimiento())
                .esInternacional(Boolean.TRUE.equals(req.getEsInternacional()))
                .build();
        tarjetaRepository.save(tarjeta);

        return toResponse(base);
    }

    public MedioPagoResponse verificar(Integer clienteId, Integer mpId) {
        MedioPago mp = getDelCliente(clienteId, mpId);
        mp.setVerificado(true);
        medioPagoRepository.save(mp);
        // La verificación de un nuevo medio puede mejorar la categoría del cliente.
        categoriaService.recalcular(clienteId);
        return toResponse(mp);
    }

    public MedioPagoResponse desactivar(Integer clienteId, Integer mpId) {
        MedioPago mp = getDelCliente(clienteId, mpId);
        mp.setActivo(false);
        medioPagoRepository.save(mp);
        return toResponse(mp);
    }

    public void eliminar(Integer clienteId, Integer mpId) {
        MedioPago mp = getDelCliente(clienteId, mpId);
        switch (mp.getTipo()) {
            case cheque -> chequeRepository.deleteById(mpId);
            case cuenta_bancaria -> cuentaRepository.deleteById(mpId);
            case tarjeta_credito -> tarjetaRepository.deleteById(mpId);
        }
        medioPagoRepository.delete(mp);
    }

    // ─── helpers ─────────────────────────────────────────────────────────

    private void validarCliente(Integer clienteId) {
        if (!clienteRepository.existsById(clienteId))
            throw new EntityNotFoundException("Cliente no encontrado: " + clienteId);
    }

    private MedioPago crearBase(Integer clienteId, TipoMedioPago tipo, Moneda moneda) {
        validarCliente(clienteId);
        MedioPago base = MedioPago.builder()
                .cliente(clienteId)
                .tipo(tipo)
                .moneda(moneda != null ? moneda : Moneda.ARS)
                .verificado(false) // lo verifica la empresa antes de habilitarlo
                .activo(true)
                .build();
        return medioPagoRepository.save(base);
    }

    private MedioPago getDelCliente(Integer clienteId, Integer mpId) {
        MedioPago mp = medioPagoRepository.findById(mpId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Medio de pago no encontrado: " + mpId));
        if (!mp.getCliente().equals(clienteId))
            throw new EntityNotFoundException(
                    "Medio de pago " + mpId + " no pertenece al cliente " + clienteId);
        return mp;
    }

    private MedioPagoResponse toResponse(MedioPago mp) {
        MedioPagoResponse.MedioPagoResponseBuilder builder = MedioPagoResponse.builder()
                .identificador(mp.getIdentificador())
                .tipo(mp.getTipo())
                .moneda(mp.getMoneda())
                .verificado(mp.getVerificado())
                .activo(mp.getActivo());

        switch (mp.getTipo()) {
            case cheque -> chequeRepository.findById(mp.getIdentificador())
                    .ifPresent(c -> builder.cheque(MedioPagoChequeDetail.builder()
                            .nroCheque(c.getNroCheque())
                            .banco(c.getBanco())
                            .montoCertificado(c.getMontoCertificado())
                            .fechaVencimiento(c.getFechaVencimiento())
                            .build()));
            case cuenta_bancaria -> cuentaRepository.findById(mp.getIdentificador())
                    .ifPresent(c -> builder.cuenta(MedioPagoCuentaDetail.builder()
                            .titular(c.getTitular())
                            .banco(c.getBanco())
                            .cbu(c.getCbu())
                            .alias(c.getAlias())
                            .esExterior(c.getEsExterior())
                            .iban(c.getIban())
                            .pais(c.getPais())
                            .tipoDeCuenta(c.getTipoDeCuenta())
                            .build()));
            case tarjeta_credito -> tarjetaRepository.findById(mp.getIdentificador())
                    .ifPresent(t -> builder.tarjeta(MedioPagoTarjetaDetail.builder()
                            .titular(t.getTitular())
                            .ultimos4(t.getUltimos4())
                            .marca(t.getMarca())
                            .vencimiento(t.getVencimiento())
                            .esInternacional(t.getEsInternacional())
                            .build()));
        }
        return builder.build();
    }
}
