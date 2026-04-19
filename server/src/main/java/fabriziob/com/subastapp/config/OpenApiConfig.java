package fabriziob.com.subastapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;

@Configuration
public class OpenApiConfig {
        static {
                io.swagger.v3.core.jackson.ModelResolver.enumsAsRef = true;
        }

        @Bean
        public OpenAPI openAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("SubastApp API")
                                                .description("API documentation for SubastApp")
                                                .version("1.0.0")
                                                .license(new License()
                                                                .name("FabrizioB Website")
                                                                .url("https://fabriziob.com/")))

                                // ── Subastas ──────────────────────────────────────────────────────
                                .path("/api/v1/ws/subastas/subscribe", new PathItem()
                                                .get(new Operation()
                                                                .addTagsItem("WebSocket — Subastas")
                                                                .summary("Suscribirse a actualizaciones de una subasta")
                                                                .description("""
                                                                                                                                                                Conectarse vía STOMP a `/api/v1/ws?userId={personaId}` y suscribirse a:
                                                                                                                                                                - `/topic/subastas/{id}` — actualizaciones generales de la subasta (estado, cambios)
                                                                                                                                                                - `/topic/subastas/{id}/pujas` — nueva puja en tiempo real

                                                                                                                                                                Las pujas se originan desde el REST API (`POST /api/v1/subastas/{id}/pujas`) y el servidor las emite a este canal.
                                                                                                                                                                Payload de ejemplo:
                                                                                ```json
                                                                                                                                                                {
                                                                                                                                                                  "itemCatalogoId": 12,
                                                                                                                                                                  "clienteId": 5,
                                                                                                                                                                  "clienteNombre": "Juan Pérez",
                                                                                                                                                                  "numeroPostor": 3,
                                                                                                                                                                  "monto": 1500.00,
                                                                                                                                                                  "fecha": "2025-04-18T21:00:00"
                                                                                                                                                                }
                                                                                ```
                                                                                                                                                                """)
                                                                .responses(new ApiResponses()
                                                                                .addApiResponse("200", new ApiResponse()
                                                                                                .description("Mensaje recibido del broker")))))

                                // ── Notificaciones ────────────────────────────────────────────────
                                .path("/api/v1/ws/notificaciones/subscribe", new PathItem()
                                                .get(new Operation()
                                                                .addTagsItem("WebSocket — Notificaciones")
                                                                .summary("Suscribirse a notificaciones personales")
                                                                .description("""
                                                                                                                                                                Conectarse vía STOMP a `/api/v1/ws?userId={personaId}` y suscribirse a:
                                                                                                                                                                - `/user/queue/notificaciones` — notificaciones en tiempo real para el usuario autenticado

                                                                                                                                                                Las notificaciones son emitidas por el servidor ante eventos del sistema (puja superada, pago confirmado, etc.).
                                                                                                                                                                Para marcarlas como leídas o consultarlas históricamente usar el REST API (`PATCH /api/v1/notificaciones/{id}/leer`).

                                                                                                                                                                Payload de ejemplo:
                                                                                ```json
                                                                                                                                                                {
                                                                                                                                                                  "identificador": 1,
                                                                                                                                                                  "titulo": "Tu puja fue superada",
                                                                                                                                                                  "descripcion": "El item **Reloj vintage** ya tiene una puja mayor.",
                                                                                                                                                                  "tipo": "subasta",
                                                                                                                                                                  "accion": "/subastas/5/catalogo/items/12",
                                                                                                                                                                  "imagen": "/productos/1/fotos/4/content",
                                                                                                                                                                  "leida": false,
                                                                                                                                                                  "fecha": "2025-04-18T21:05:00"
                                                                                                                                                                }
                                                                                ```
                                                                                                                                                                """)
                                                                .responses(new ApiResponses()
                                                                                .addApiResponse("200", new ApiResponse()
                                                                                                .description("Notificación recibida del broker")))));
        }
}