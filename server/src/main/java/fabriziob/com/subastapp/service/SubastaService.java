package fabriziob.com.subastapp.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.controller.subasta.SubastaEventoResponse;
import fabriziob.com.subastapp.controller.subasta.SubastaRequest;
import fabriziob.com.subastapp.controller.subasta.SubastaResponse;
import fabriziob.com.subastapp.entity.ItemCatalogo;
import fabriziob.com.subastapp.entity.Subasta;
import fabriziob.com.subastapp.entity.SubastaExtra;
import fabriziob.com.subastapp.entity.Subastador;
import fabriziob.com.subastapp.entity.enums.CategoriaSubasta;
import fabriziob.com.subastapp.entity.enums.EstadoAceptacionItem;
import fabriziob.com.subastapp.entity.enums.EstadoDetalladoSubasta;
import fabriziob.com.subastapp.entity.enums.EstadoSubasta;
import fabriziob.com.subastapp.entity.enums.Moneda;
import fabriziob.com.subastapp.repository.ItemCatalogoRepository;
import fabriziob.com.subastapp.repository.SubastaExtraRepository;
import fabriziob.com.subastapp.repository.SubastaRepository;
import fabriziob.com.subastapp.repository.SubastadorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class SubastaService {

        private final SubastaRepository subastaRepository;
        private final SubastaExtraRepository subastaExtraRepository;
        private final SubastadorRepository subastadorRepository;
        private final ItemCatalogoRepository itemCatalogoRepository;
        private final SimpMessagingTemplate messagingTemplate;

        // ─── lecturas ──────────────────────────────────────────────────────────

        @Transactional(readOnly = true)
        public Page<SubastaResponse> getAll(EstadoSubasta estado, CategoriaSubasta categoria,
                        LocalDate fecha, Pageable pageable) {
                return subastaRepository.buscar(estado, categoria, fecha, pageable)
                                .map(this::toResponse);
        }

        @Transactional(readOnly = true)
        public SubastaResponse getById(Integer id) {
                Subasta subasta = subastaRepository.findByIdWithExtra(id)
                                .orElseThrow(() -> new EntityNotFoundException("Subasta no encontrada: " + id));
                return toResponse(subasta);
        }

        // ─── escrituras / carga ──────────────────────────────────────────────────

        public SubastaResponse create(SubastaRequest req) {
                Subastador subastador = null;
                if (req.getSubastadorId() != null) {
                        subastador = subastadorRepository.findById(req.getSubastadorId())
                                        .orElseThrow(() -> new EntityNotFoundException(
                                                        "Subastador no encontrado: " + req.getSubastadorId()));
                }

                Subasta subasta = Subasta.builder()
                                .fecha(req.getFecha())
                                .hora(req.getHora())
                                .estado(EstadoSubasta.abierta)
                                .subastador(subastador)
                                .ubicacion(req.getUbicacion())
                                .capacidadAsistentes(req.getCapacidadAsistentes())
                                .tieneDeposito(req.getTieneDeposito())
                                .seguridadPropia(req.getSeguridadPropia())
                                .categoria(req.getCategoria())
                                .build();
                subasta = subastaRepository.save(subasta);

                SubastaExtra extra = SubastaExtra.builder()
                                .subasta(subasta)
                                .moneda(req.getMoneda() != null ? req.getMoneda() : Moneda.ARS)
                                .esColeccion(Boolean.TRUE.equals(req.getEsColeccion()))
                                .nombreColeccion(req.getNombreColeccion())
                                .fechaFin(req.getFechaFin())
                                .horaFin(req.getHoraFin())
                                .build();
                subastaExtraRepository.save(extra);
                subasta.setSubastaExtra(extra);

                return toResponse(subasta);
        }

        public SubastaResponse cambiarEstado(Integer id, EstadoSubasta estado) {
                Subasta subasta = subastaRepository.findByIdWithExtra(id)
                                .orElseThrow(() -> new EntityNotFoundException("Subasta no encontrada: " + id));
                subasta.setEstado(estado);
                subastaRepository.save(subasta);
                return toResponse(subasta);
        }

        public SubastaResponse cambiarEstadoDetallado(Integer id, EstadoDetalladoSubasta estadoDetallado) {
                Subasta subasta = subastaRepository.findByIdWithExtra(id)
                                .orElseThrow(() -> new EntityNotFoundException("Subasta no encontrada: " + id));
                SubastaExtra extra = subasta.getSubastaExtra();
                if (extra == null)
                        throw new IllegalStateException("La subasta no tiene datos extra: " + id);

                if (estadoDetallado == EstadoDetalladoSubasta.en_curso) {
                        iniciarSubasta(subasta, extra);
                }

                extra.setEstadoDetallado(estadoDetallado);
                subastaExtraRepository.save(extra);
                return toResponse(subasta);
        }

        // ─── helpers ───────────────────────────────────────────────────────────

        private void iniciarSubasta(Subasta subasta, SubastaExtra extra) {
                if (extra.getFechaFin() == null || extra.getHoraFin() == null)
                        throw new IllegalStateException(
                                        "La subasta no tiene fecha/hora de fin. Defínalas antes de iniciarla.");

                LocalDateTime inicio = LocalDateTime.of(subasta.getFecha(), subasta.getHora());
                LocalDateTime fin = LocalDateTime.of(extra.getFechaFin(), extra.getHoraFin());
                long totalMinutos = ChronoUnit.MINUTES.between(inicio, fin);
                if (totalMinutos <= 0)
                        throw new IllegalStateException("La fecha/hora de fin debe ser posterior al inicio.");

                long countAceptados = itemCatalogoRepository.countBySubastaIdAndEstadoAceptacion(
                                subasta.getIdentificador(), EstadoAceptacionItem.aceptado);
                if (countAceptados == 0)
                        throw new IllegalStateException(
                                        "La subasta no tiene artículos aceptados en el catálogo.");

                long minutosPorItem = totalMinutos / countAceptados;
                if (minutosPorItem < 10)
                        throw new IllegalStateException(
                                        "La duración por artículo sería de " + minutosPorItem
                                                        + " min, lo cual es menor al mínimo de 10 min. "
                                                        + "Reducí la cantidad de artículos o extendé la fecha de fin.");

                ItemCatalogo primerItem = itemCatalogoRepository
                                .findFirstBySubastaIdAndEstadoAceptacionAndNoSubastado(
                                                subasta.getIdentificador(), EstadoAceptacionItem.aceptado)
                                .orElseThrow(() -> new IllegalStateException(
                                                "No se encontró ningún artículo aceptado sin subastar."));

                extra.setItemActual(primerItem);
                extra.setInicioItemActualTs(Instant.now());

                messagingTemplate.convertAndSend("/topic/subastas/" + subasta.getIdentificador(),
                                SubastaEventoResponse.builder()
                                                .tipo("SUBASTA_INICIADA")
                                                .subastaId(subasta.getIdentificador())
                                                .itemId(primerItem.getIdentificador())
                                                .build());
        }

        SubastaResponse toResponse(Subasta s) {
                SubastaExtra extra = s.getSubastaExtra();
                Subastador subastador = s.getSubastador();
                return SubastaResponse.builder()
                                .identificador(s.getIdentificador())
                                .fecha(s.getFecha())
                                .hora(s.getHora())
                                .estado(s.getEstado())
                                .subastadorId(subastador != null ? subastador.getIdentificador() : null)
                                .subastadorNombre(subastador != null && subastador.getPersona() != null
                                                ? subastador.getPersona().getNombre()
                                                : null)
                                .ubicacion(s.getUbicacion())
                                .capacidadAsistentes(s.getCapacidadAsistentes())
                                .tieneDeposito(s.getTieneDeposito())
                                .seguridadPropia(s.getSeguridadPropia())
                                .categoria(s.getCategoria())
                                .moneda(extra != null ? extra.getMoneda() : null)
                                .estadoDetallado(extra != null ? extra.getEstadoDetallado() : null)
                                .esColeccion(extra != null ? extra.getEsColeccion() : null)
                                .nombreColeccion(extra != null ? extra.getNombreColeccion() : null)
                                .fechaFin(extra != null ? extra.getFechaFin() : null)
                                .horaFin(extra != null ? extra.getHoraFin() : null)
                                .itemActualId(extra != null && extra.getItemActual() != null
                                                ? extra.getItemActual().getIdentificador()
                                                : null)
                                .inicioItemActualTs(extra != null ? extra.getInicioItemActualTs() : null)
                                .build();
        }
}
