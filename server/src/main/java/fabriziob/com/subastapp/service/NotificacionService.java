package fabriziob.com.subastapp.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.controller.notificacion.NotificacionResponse;
import fabriziob.com.subastapp.entity.Cliente;
import fabriziob.com.subastapp.entity.Notificacion;
import fabriziob.com.subastapp.entity.Persona;
import fabriziob.com.subastapp.repository.ClienteRepository;
import fabriziob.com.subastapp.repository.NotificacionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

/**
 * Notificaciones para personas/clientes. Centraliza el patrón "persistir +
 * emitir en vivo": guarda la {@link Notificacion} en la bandeja del
 * destinatario y, si tiene email, la emite por WebSocket a
 * /user/queue/notificaciones reusando {@link WsNotificacionService}.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class NotificacionService {

        private final NotificacionRepository notificacionRepository;
        private final ClienteRepository clienteRepository;
        private final WsNotificacionService wsNotificacionService;

        // ─── emisión ─────────────────────────────────────────────────────────────

        /**
         * Persiste una notificación para el cliente y la emite en vivo por WS.
         *
         * @param tipoWs         tipo para el payload WS (warning/success/info/…)
         * @param tipoPersistido string libre que se guarda en {@code Notificacion.tipo}
         *                       (p. ej. "pago", "envio", "multa")
         */
        public void notificarCliente(Integer clienteId, WsNotificacionService.Tipo tipoWs,
                        String tipoPersistido, String titulo, String descripcion) {
                Cliente cliente = clienteRepository.findById(clienteId)
                                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado: " + clienteId));
                Persona persona = cliente.getPersona();

                Notificacion notificacion = Notificacion.builder()
                                .destinatario(persona)
                                .titulo(titulo)
                                .descripcion(descripcion)
                                .tipo(tipoPersistido)
                                .leida(false)
                                .build();
                notificacionRepository.save(notificacion);

                String email = persona != null && persona.getPersonaExtra() != null
                                ? persona.getPersonaExtra().getEmail()
                                : null;
                if (email != null && !email.isBlank())
                        wsNotificacionService.enviar(email, tipoWs, titulo, descripcion);
        }

        // ─── consultas (NotificacionController) ────────────────────────────────────

        @Transactional(readOnly = true)
        public Page<NotificacionResponse> getAll(Integer destinatarioId, String tipo, Boolean leida,
                        Pageable pageable) {
                Page<Notificacion> page;
                if (tipo != null) {
                        page = notificacionRepository.findByDestinatario_IdentificadorAndTipo(destinatarioId, tipo,
                                        pageable);
                } else if (leida != null) {
                        page = notificacionRepository.findByDestinatario_IdentificadorAndLeida(destinatarioId, leida,
                                        pageable);
                } else {
                        page = notificacionRepository.findByDestinatario_Identificador(destinatarioId, pageable);
                }
                return page.map(this::toResponse);
        }

        @Transactional(readOnly = true)
        public NotificacionResponse getById(Integer id) {
                return toResponse(findOrThrow(id));
        }

        public NotificacionResponse marcarLeida(Integer id) {
                Notificacion notificacion = findOrThrow(id);
                notificacion.setLeida(true);
                notificacionRepository.save(notificacion);
                return toResponse(notificacion);
        }

        // ─── helpers ───────────────────────────────────────────────────────────────

        private Notificacion findOrThrow(Integer id) {
                return notificacionRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException("Notificación no encontrada: " + id));
        }

        private NotificacionResponse toResponse(Notificacion n) {
                Persona destinatario = n.getDestinatario();
                return NotificacionResponse.builder()
                                .identificador(n.getIdentificador())
                                .destinatarioId(destinatario != null ? destinatario.getIdentificador() : null)
                                .destinatarioNombre(destinatario != null ? destinatario.getNombre() : null)
                                .titulo(n.getTitulo())
                                .descripcion(n.getDescripcion())
                                .fecha(n.getFecha())
                                .accion(n.getAccion())
                                .imagen(n.getImagen())
                                .tipo(n.getTipo())
                                .leida(n.getLeida())
                                .build();
        }
}
