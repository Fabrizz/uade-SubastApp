package fabriziob.com.subastapp.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.controller.subasta.AsistenteRequest;
import fabriziob.com.subastapp.controller.subasta.AsistenteResponse;
import fabriziob.com.subastapp.entity.AsistenciaActual;
import fabriziob.com.subastapp.entity.Asistente;
import fabriziob.com.subastapp.entity.Cliente;
import fabriziob.com.subastapp.entity.Subasta;
import fabriziob.com.subastapp.entity.enums.CategoriaSubasta;
import fabriziob.com.subastapp.entity.enums.ClienteCategoria;
import fabriziob.com.subastapp.entity.enums.EstadoDetalladoSubasta;
import fabriziob.com.subastapp.repository.AsistenciaActualRepository;
import fabriziob.com.subastapp.repository.AsistenteRepository;
import fabriziob.com.subastapp.repository.ClienteRepository;
import fabriziob.com.subastapp.repository.SubastaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AsistenteService {

        private static final String ESTADO_ACTIVO = "activo";
        private static final String ESTADO_FINALIZADO = "finalizado";

        private final AsistenteRepository asistenteRepository;
        private final AsistenciaActualRepository asistenciaActualRepository;
        private final SubastaRepository subastaRepository;
        private final ClienteRepository clienteRepository;

        // ─── unirse (idempotente) ────────────────────────────────────────────────

        public AsistenteResponse unirse(Integer subastaId, AsistenteRequest req) {
                Subasta subasta = subastaRepository.findById(subastaId)
                                .orElseThrow(() -> new EntityNotFoundException("Subasta no encontrada: " + subastaId));
                Cliente cliente = clienteRepository.findById(req.getClienteId())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Cliente no encontrado: " + req.getClienteId()));

                // Gating por estado detallado: la subasta debe estar en curso.
                if (subasta.getSubastaExtra() == null || subasta.getSubastaExtra().getEstadoDetallado() != EstadoDetalladoSubasta.en_curso) {
                        throw new IllegalStateException("La subasta no ha comenzado o ya ha finalizado.");
                }

                // Gating por categoría: la categoría de la subasta debe ser ≤ la del cliente.
                if (!categoriaPermite(subasta.getCategoria(), cliente.getCategoria()))
                        throw new SecurityException(
                                        "La categoría de la subasta (" + subasta.getCategoria()
                                                        + ") supera la categoría del cliente (" + cliente.getCategoria() + ")");

                // Regla "una sola subasta a la vez": no puede tener asistencia activa en otra subasta.
                List<AsistenciaActual> activas = asistenciaActualRepository
                                .findByAsistente_Cliente_IdentificadorAndEstado(req.getClienteId(), ESTADO_ACTIVO);
                for (AsistenciaActual a : activas) {
                        Integer otraSubastaId = a.getAsistente().getSubasta().getIdentificador();
                        if (!otraSubastaId.equals(subastaId))
                                throw new IllegalStateException(
                                                "El cliente ya está conectado a otra subasta (" + otraSubastaId + ")");
                }

                // Reusar el asistente existente del par (cliente, subasta) o crear uno nuevo.
                Asistente asistente = asistenteRepository
                                .findByCliente_IdentificadorAndSubasta_Identificador(req.getClienteId(), subastaId)
                                .orElseGet(() -> {
                                        int numero = asistenteRepository.findBySubasta_Identificador(subastaId).size() + 1;
                                        return asistenteRepository.save(Asistente.builder()
                                                        .cliente(cliente)
                                                        .subasta(subasta)
                                                        .numeroPostor(numero)
                                                        .build());
                                });

                // Reusar la asistencia activa o abrir una nueva.
                AsistenciaActual asistencia = asistenciaActualRepository
                                .findByAsistente_IdentificadorAndEstado(asistente.getIdentificador(), ESTADO_ACTIVO)
                                .stream().findFirst()
                                .orElseGet(() -> asistenciaActualRepository.save(AsistenciaActual.builder()
                                                .asistente(asistente)
                                                .estado(ESTADO_ACTIVO)
                                                .fechaHoraIngreso(LocalDateTime.now())
                                                .build()));

                return toResponse(asistente, asistencia);
        }

        // ─── consultas ─────────────────────────────────────────────────────────

        @Transactional(readOnly = true)
        public AsistenteResponse getAsistenciaActiva(Integer subastaId, Integer clienteId) {
                AsistenciaActual asistencia = asistenciaActualRepository
                                .findActivaBySubastaIdAndClienteId(subastaId, clienteId)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "El cliente " + clienteId + " no tiene asistencia activa en la subasta "
                                                                + subastaId));
                return toResponse(asistencia.getAsistente(), asistencia);
        }

        /**
         * Asistencia activa del cliente en CUALQUIER subasta (regla "una sola subasta a la vez"),
         * sin necesidad de conocer de antemano el subastaId. Útil para rehidratar el estado
         * de sesión del cliente al abrir la app.
         */
        @Transactional(readOnly = true)
        public AsistenteResponse getAsistenciaActivaDelCliente(Integer clienteId) {
                AsistenciaActual asistencia = asistenciaActualRepository
                                .findByAsistente_Cliente_IdentificadorAndEstado(clienteId, ESTADO_ACTIVO)
                                .stream().findFirst()
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "El cliente " + clienteId + " no tiene asistencia activa en ninguna subasta"));
                return toResponse(asistencia.getAsistente(), asistencia);
        }

        @Transactional(readOnly = true)
        public Page<AsistenteResponse> getAsistentes(Integer subastaId, Pageable pageable) {
                if (!subastaRepository.existsById(subastaId))
                        throw new EntityNotFoundException("Subasta no encontrada: " + subastaId);

                List<AsistenteResponse> all = asistenciaActualRepository.findActivosBySubastaId(subastaId).stream()
                                .map(a -> toResponse(a.getAsistente(), a))
                                .toList();

                int start = (int) pageable.getOffset();
                int end = Math.min(start + pageable.getPageSize(), all.size());
                List<AsistenteResponse> content = start <= end && start < all.size()
                                ? all.subList(start, end)
                                : List.of();
                return new PageImpl<>(content, pageable, all.size());
        }

        // ─── abandonar ─────────────────────────────────────────────────────────

        public void abandonar(Integer subastaId, Integer idAsistente) {
                Asistente asistente = asistenteRepository.findById(idAsistente)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Asistente no encontrado: " + idAsistente));
                if (asistente.getSubasta() == null
                                || !asistente.getSubasta().getIdentificador().equals(subastaId))
                        throw new IllegalArgumentException(
                                        "El asistente " + idAsistente + " no pertenece a la subasta " + subastaId);

                asistenciaActualRepository
                                .findByAsistente_IdentificadorAndEstado(idAsistente, ESTADO_ACTIVO)
                                .forEach(a -> {
                                        a.setEstado(ESTADO_FINALIZADO);
                                        a.setFechaHoraSalida(LocalDateTime.now());
                                        asistenciaActualRepository.save(a);
                                });
        }

        /**
         * Finaliza cualquier asistencia activa del cliente (en cualquier subasta), sin
         * notificar por su cuenta. Se usa cuando un cambio de categoría debe forzar la
         * salida — la elegibilidad se vuelve a validar en el próximo "unirse".
         */
        public void desconectarDeSubastaActiva(Integer clienteId) {
                asistenciaActualRepository
                                .findByAsistente_Cliente_IdentificadorAndEstado(clienteId, ESTADO_ACTIVO)
                                .forEach(a -> {
                                        a.setEstado(ESTADO_FINALIZADO);
                                        a.setFechaHoraSalida(LocalDateTime.now());
                                        asistenciaActualRepository.save(a);
                                });
        }

        // ─── helpers ───────────────────────────────────────────────────────────

        /**
         * La categoría de la subasta debe ser menor o igual que la del cliente.
         * Los nombres de CategoriaSubasta coinciden con los de ClienteCategoria, cuyo
         * ordinal es el ranking (comun < … < platino). admin siempre puede acceder.
         */
        private boolean categoriaPermite(CategoriaSubasta subasta, ClienteCategoria cliente) {
                if (cliente == null)
                        return false;
                if (cliente == ClienteCategoria.admin)
                        return true;
                if (subasta == null)
                        return true;
                int rankSubasta = ClienteCategoria.valueOf(subasta.name()).ordinal();
                return rankSubasta <= cliente.ordinal();
        }

        private AsistenteResponse toResponse(Asistente asistente, AsistenciaActual asistencia) {
                Cliente cliente = asistente.getCliente();
                return AsistenteResponse.builder()
                                .identificador(asistente.getIdentificador())
                                .subastaId(asistente.getSubasta() != null ? asistente.getSubasta().getIdentificador() : null)
                                .numeroPostor(asistente.getNumeroPostor())
                                .clienteId(cliente != null ? cliente.getIdentificador() : null)
                                .clienteNombre(cliente != null && cliente.getPersona() != null
                                                ? cliente.getPersona().getNombre()
                                                : null)
                                .estado(asistencia != null ? asistencia.getEstado() : null)
                                .fechaHoraIngreso(asistencia != null ? asistencia.getFechaHoraIngreso() : null)
                                .fechaHoraSalida(asistencia != null ? asistencia.getFechaHoraSalida() : null)
                                .build();
        }
}
