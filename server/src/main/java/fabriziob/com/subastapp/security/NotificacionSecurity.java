package fabriziob.com.subastapp.security;

import org.springframework.stereotype.Component;

import fabriziob.com.subastapp.repository.NotificacionRepository;
import lombok.RequiredArgsConstructor;

@Component("notificacionSecurity")
@RequiredArgsConstructor
public class NotificacionSecurity {
    private final NotificacionRepository notificacionRepository;

    public boolean isOwner(Integer notificacionId, Integer personaId) {
        return notificacionRepository.existsByIdentificadorAndDestinatario_Identificador(notificacionId, personaId);
    }
}
