package fabriziob.com.subastapp.config;

import java.util.Arrays;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.repository.PersonaExtraRepository;
import fabriziob.com.subastapp.service.ClienteService;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class FixAdminsConfig {

    private static final Logger log = LoggerFactory.getLogger(FixAdminsConfig.class);

    private final PersonaExtraRepository personaExtraRepository;
    private final ClienteService clienteService;

    @Value("${app.admins-emails:}")
    private String adminsEmails;

    @Transactional
    @EventListener(ApplicationReadyEvent.class)
    public void admitirAdminsPendientes() {
        if (adminsEmails.isBlank()) {
            log.info("[FixAdmins] app.admins-emails no configurado, se omite.");
            return;
        }

        String[] emails = Arrays.stream(adminsEmails.split(","))
                .map(String::trim)
                .filter(e -> !e.isEmpty())
                .toArray(String[]::new);

        log.info("[FixAdmins] Admins configurados: {}", (Object) emails);

        for (String email : emails) {
            personaExtraRepository.findByEmail(email).ifPresentOrElse(pe -> {
                var cliente = pe.getPersona().getCliente();
                if (cliente == null) {
                    log.warn("[FixAdmins] {} > sin Cliente asociado, se omite.", email);
                } else if ("si".equals(cliente.getAdmitido())) {
                    log.info("[FixAdmins] {} > ya admitido, sin cambios.", email);
                } else {
                    clienteService.admitir(cliente.getIdentificador());
                    log.info("[FixAdmins] {} > admitido correctamente.", email);
                }
            }, () -> log.info("[FixAdmins] {} > aún no registrado, se omite.", email));
        }
    }
}
