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
                // use Reusable Enums for Swagger generation:
                // see https://springdoc.org/#how-can-i-apply-enumasref-true-to-all-enums
                io.swagger.v3.core.jackson.ModelResolver.enumsAsRef = true;
        }

        @Bean
        public OpenAPI openAPI() {
                return new OpenAPI()
                                .info(
                                                new Info()
                                                                .title("SubastApp API")
                                                                .description("API documentation for SubastApp")
                                                                .version("1.0.0")
                                                                .license(new License().name("SubastApp License")
                                                                                .url("https://subastapp.fabriziob.com/mock")))
                                .path("/api/v1/ws/subastas/subscribe", new PathItem()
                                                .get(new Operation()
                                                                .addTagsItem("WebSocket Broker")
                                                                .summary("Recibe actualizaciones de la subasta/puja activa/s.")
                                                                .responses(new ApiResponses()
                                                                                .addApiResponse("200", new ApiResponse()
                                                                                                .description("Mensaje recibido del broker")))));
        }
}