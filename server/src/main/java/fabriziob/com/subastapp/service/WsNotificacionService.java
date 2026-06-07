package fabriziob.com.subastapp.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.repository.ClienteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WsNotificacionService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ClienteRepository clienteRepository;

    public enum Tipo {
        warning, success, info, category_update
    }

    public void enviar(String email, Tipo tipo, String title, String description) {
        var payload = new WsPayload(
                UUID.randomUUID().toString(),
                tipo,
                title,
                description,
                Instant.now().toString());
        messagingTemplate.convertAndSendToUser(email, "/queue/notificaciones", payload);
    }

    @Transactional(readOnly = true)
    public void enviarACliente(Integer clienteId, Tipo tipo, String title, String description) {
        var cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado: " + clienteId));
        String email = cliente.getPersona().getPersonaExtra().getEmail();
        enviar(email, tipo, title, description);
    }

    public record WsPayload(String id, Tipo type, String title, String description, String createdAt) {}
}
