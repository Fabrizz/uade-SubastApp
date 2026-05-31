package fabriziob.com.subastapp.service;

import java.util.EnumSet;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.entity.Cliente;
import fabriziob.com.subastapp.entity.ClienteExtra;
import fabriziob.com.subastapp.entity.MedioPago;
import fabriziob.com.subastapp.entity.enums.ClienteCategoria;
import fabriziob.com.subastapp.entity.enums.TipoMedioPago;
import fabriziob.com.subastapp.repository.ClienteRepository;
import fabriziob.com.subastapp.repository.MedioPagoCuentaRepository;
import fabriziob.com.subastapp.repository.MedioPagoRepository;
import fabriziob.com.subastapp.repository.MedioPagoTarjetaRepository;
import fabriziob.com.subastapp.repository.PujoRepository;
import fabriziob.com.subastapp.repository.RegistroDeSubastaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

/**
 * Mejora de categoría por diversidad de medios de pago verificados + actividad.
 * Sistema de puntaje: la categoría calculada nunca baja de la categoría base
 * asignada por la investigación ({@code mejorEntre(base, candidata)}).
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CategoriaService {

    private final ClienteRepository clienteRepository;
    private final MedioPagoRepository medioPagoRepository;
    private final MedioPagoCuentaRepository cuentaRepository;
    private final MedioPagoTarjetaRepository tarjetaRepository;
    private final RegistroDeSubastaRepository registroRepository;
    private final PujoRepository pujoRepository;

    public Cliente recalcular(Integer clienteId) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado: " + clienteId));

        int puntaje = puntajeDiversidad(clienteId) + puntajeActividad(clienteId);

        ClienteCategoria candidata = categoriaPorPuntaje(puntaje);
        ClienteExtra extra = cliente.getClienteExtra();
        ClienteCategoria base = extra != null && extra.getCategoriaBase() != null
                ? extra.getCategoriaBase()
                : cliente.getCategoria();

        cliente.setCategoria(ClienteCategoria.mejorEntre(base, candidata));
        if (extra != null)
            extra.setPuntaje(puntaje);

        return cliente;
    }

    // Diversidad: +2 por cada tipo de medio verificado distinto (0..6),
    // +1 si hay cuenta exterior verificada, +1 si hay tarjeta internacional verificada.
    private int puntajeDiversidad(Integer clienteId) {
        List<MedioPago> verificados = medioPagoRepository.findByCliente(clienteId).stream()
                .filter(mp -> Boolean.TRUE.equals(mp.getVerificado())
                        && Boolean.TRUE.equals(mp.getActivo()))
                .toList();

        EnumSet<TipoMedioPago> tipos = EnumSet.noneOf(TipoMedioPago.class);
        verificados.forEach(mp -> tipos.add(mp.getTipo()));
        int puntos = tipos.size() * 2;

        boolean cuentaExterior = verificados.stream()
                .filter(mp -> mp.getTipo() == TipoMedioPago.cuenta_bancaria)
                .anyMatch(mp -> cuentaRepository.findById(mp.getIdentificador())
                        .map(c -> Boolean.TRUE.equals(c.getEsExterior()))
                        .orElse(false));
        boolean tarjetaInternacional = verificados.stream()
                .filter(mp -> mp.getTipo() == TipoMedioPago.tarjeta_credito)
                .anyMatch(mp -> tarjetaRepository.findById(mp.getIdentificador())
                        .map(t -> Boolean.TRUE.equals(t.getEsInternacional()))
                        .orElse(false));

        if (cuentaExterior)
            puntos += 1;
        if (tarjetaInternacional)
            puntos += 1;
        return puntos;
    }

    // Actividad: +1 por subasta registrada (cap 10), +1 cada 5 pujas (cap 5).
    private int puntajeActividad(Integer clienteId) {
        long registros = registroRepository.countByCliente_Identificador(clienteId);
        long pujas = pujoRepository.countByAsistente_Cliente_Identificador(clienteId);
        int puntosRegistros = (int) Math.min(registros, 10);
        int puntosPujas = (int) Math.min(pujas / 5, 5);
        return puntosRegistros + puntosPujas;
    }

    private ClienteCategoria categoriaPorPuntaje(int puntaje) {
        if (puntaje >= 14)
            return ClienteCategoria.platino;
        if (puntaje >= 10)
            return ClienteCategoria.oro;
        if (puntaje >= 6)
            return ClienteCategoria.plata;
        if (puntaje >= 3)
            return ClienteCategoria.especial;
        return ClienteCategoria.comun;
    }
}
