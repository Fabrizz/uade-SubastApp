package fabriziob.com.subastapp.service;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String RESEND_URL = "https://api.resend.com/emails";

    private final String apiKey;
    private final String from;
    private final String discordWebhookUrl;
    private final RestClient restClient;

    public EmailService(
            @Value("${resend.api-key:}") String apiKey,
            @Value("${resend.from:onboarding@resend.dev}") String from,
            @Value("${discord.webhook-url:}") String discordWebhookUrl) {
        this.apiKey = apiKey;
        this.from = from;
        this.discordWebhookUrl = discordWebhookUrl;
        this.restClient = RestClient.create();
    }

    /** Mail de recuperación de contraseña: nueva clave temporal de un solo uso. */
    public void enviarRecuperacion(String email, String claveTemporal) {
        String asunto = "SubastApp · Recuperación de contraseña";
        String html = """
                <h2>Recuperación de contraseña</h2>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
                <p>Tu contraseña temporal es: <strong>%s</strong></p>
                <p>Ingresá a la app y usá esta clave para establecer una nueva contraseña.</p>
                <p>Si no solicitaste este cambio, podés ignorar este mensaje.</p>
                """.formatted(claveTemporal);
        enviar(email, asunto, html);
    }

    /** Mail de la etapa 1: avisa que fue aprobado y comparte la clave temporal. */
    public void enviarBienvenida(String email, String claveTemporal) {
        String asunto = "SubastApp · Su registro fue aprobado";
        String html = """
                <h2>¡Bienvenido a SubastApp!</h2>
                <p>Su identidad fue verificada y su registro fue aprobado.</p>
                <p>Ingrese a la app y complete el registro generando su clave personal.</p>
                <p>Su clave temporal es: <strong>%s</strong></p>
                """.formatted(claveTemporal);
        enviar(email, asunto, html);
    }

    private void enviar(String to, String asunto, String html) {
        if (discordWebhookUrl != null && !discordWebhookUrl.isBlank()) {
            try {
                String content = "**[Mail]** To: `%s` | Subject: `%s`\n%s".formatted(to, asunto, html);
                restClient.post()
                        .uri(discordWebhookUrl)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Map.of("content", content))
                        .retrieve()
                        .toBodilessEntity();
                log.info("Mail enviado a Discord webhook (destinatario: {})", to);
            } catch (Exception e) {
                log.error("Error enviando a Discord webhook: {}", e.getMessage());
            }
        }

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("RESEND_API_KEY no configurada. Mail a {} NO enviado. Clave/contenido: {}", to, html);
            return;
        }
        try {
            restClient.post()
                    .uri(RESEND_URL)
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "from", from,
                            "to", to,
                            "subject", asunto,
                            "html", html))
                    .retrieve()
                    .toBodilessEntity();
            log.info("Mail enviado a {} via Resend", to);
        } catch (Exception e) {
            log.error("Error enviando mail a {} via Resend: {}", to, e.getMessage());
        }
    }
}
