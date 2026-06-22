package fabriziob.com.subastapp.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.controller.subasta.SubastaEventoResponse;
import fabriziob.com.subastapp.entity.ItemCatalogo;
import fabriziob.com.subastapp.entity.Subasta;
import fabriziob.com.subastapp.entity.SubastaExtra;
import fabriziob.com.subastapp.entity.enums.EstadoAceptacionItem;
import fabriziob.com.subastapp.entity.enums.EstadoDetalladoSubasta;
import fabriziob.com.subastapp.entity.enums.EstadoSubasta;
import fabriziob.com.subastapp.repository.ItemCatalogoRepository;
import fabriziob.com.subastapp.repository.SubastaExtraRepository;
import fabriziob.com.subastapp.repository.SubastaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubastaSchedulerService {

        private final SubastaExtraRepository subastaExtraRepository;
        private final SubastaRepository subastaRepository;
        private final ItemCatalogoRepository itemCatalogoRepository;
        private final PujoService pujoService;
        private final SimpMessagingTemplate messagingTemplate;

        @Scheduled(fixedDelay = 15_000)
        @Transactional
        public void procesarItemsVencidos() {
                List<SubastaExtra> activas = subastaExtraRepository.findActivasConItemVigente();
                for (SubastaExtra extra : activas) {
                        try {
                                procesarSubasta(extra);
                        } catch (Exception e) {
                                log.error("Error procesando subasta {}: {}",
                                                extra.getIdentificador(), e.getMessage(), e);
                        }
                }
        }

        private void procesarSubasta(SubastaExtra extra) {
                Subasta subasta = extra.getSubasta();

                if (subasta.getFecha() == null || subasta.getHora() == null
                                || extra.getFechaFin() == null || extra.getHoraFin() == null) {
                        log.warn("Subasta {} sin fecha/hora completa, saltando.", subasta.getIdentificador());
                        return;
                }

                long countAceptados = itemCatalogoRepository.countBySubastaIdAndEstadoAceptacion(
                                subasta.getIdentificador(), EstadoAceptacionItem.aceptado);
                if (countAceptados == 0) return;

                LocalDateTime inicio = LocalDateTime.of(subasta.getFecha(), subasta.getHora());
                LocalDateTime fin = LocalDateTime.of(extra.getFechaFin(), extra.getHoraFin());
                long totalMinutos = ChronoUnit.MINUTES.between(inicio, fin);
                if (totalMinutos <= 0) return;

                long minutosPorItem = totalMinutos / countAceptados;
                boolean itemYaCerrado = "si".equals(extra.getItemActual().getSubastado());
                Instant expira = extra.getInicioItemActualTs().plusSeconds(minutosPorItem * 60L);

                // Si el ítem ya fue cerrado manualmente por el martillero, avanzar de inmediato
                if (!itemYaCerrado && Instant.now().isBefore(expira)) return;

                log.info("Subasta {}: {} para ítem {}. Procesando avance.",
                                subasta.getIdentificador(),
                                itemYaCerrado ? "cerrado manualmente" : "tiempo vencido",
                                extra.getItemActual().getIdentificador());

                ItemCatalogo itemCerrado = extra.getItemActual();
                if (!itemYaCerrado) {
                        pujoService.cerrarItemAutomatico(subasta, itemCerrado);
                }

                itemCatalogoRepository
                                .findFirstBySubastaIdAndEstadoAceptacionAndNoSubastado(
                                                subasta.getIdentificador(), EstadoAceptacionItem.aceptado)
                                .stream().findFirst()
                                .ifPresentOrElse(
                                                siguiente -> avanzarItem(extra, siguiente),
                                                () -> cerrarSubasta(subasta, extra));
        }

        private void avanzarItem(SubastaExtra extra, ItemCatalogo siguiente) {
                extra.setItemActual(siguiente);
                extra.setInicioItemActualTs(Instant.now());
                subastaExtraRepository.save(extra);

                log.info("Subasta {}: avanzando a ítem {}.",
                                extra.getIdentificador(), siguiente.getIdentificador());

                messagingTemplate.convertAndSend(
                                "/topic/subastas/" + extra.getIdentificador(),
                                SubastaEventoResponse.builder()
                                                .tipo("ITEM_SIGUIENTE")
                                                .subastaId(extra.getIdentificador())
                                                .itemId(siguiente.getIdentificador())
                                                .build());
        }

        private void cerrarSubasta(Subasta subasta, SubastaExtra extra) {
                subasta.setEstado(EstadoSubasta.cerrada);
                extra.setEstadoDetallado(EstadoDetalladoSubasta.finalizada);
                extra.setItemActual(null);
                extra.setInicioItemActualTs(null);

                subastaRepository.save(subasta);
                subastaExtraRepository.save(extra);

                log.info("Subasta {} finalizada automáticamente.", subasta.getIdentificador());

                messagingTemplate.convertAndSend(
                                "/topic/subastas/" + subasta.getIdentificador(),
                                SubastaEventoResponse.builder()
                                                .tipo("SUBASTA_FINALIZADA")
                                                .subastaId(subasta.getIdentificador())
                                                .build());
        }
}
