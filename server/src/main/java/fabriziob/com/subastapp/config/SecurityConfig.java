package fabriziob.com.subastapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import lombok.RequiredArgsConstructor;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

import java.util.Arrays;

import lombok.extern.slf4j.Slf4j;

/**
 * Configuracion de seguridad de la aplicacion
 * Permite el acceso a las rutas de autenticacion sin token
 * y protege el resto de las rutas
 * Agrega el filtro de autenticacion JWT
 */
@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(req -> req
                        // Permitir CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // [AUTH]
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        // [PAISES]
                        .requestMatchers(HttpMethod.GET, "/api/v1/paises", "/api/v1/paises/*").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/paises").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/paises/*").hasRole("ADMIN")
                        // [SUBASTAS]
                        // Browsing subastas/catálogo/productos is public; precios are stripped
                        // for unauthenticated requests in the service layer (see CatalogoService).
                        .requestMatchers(HttpMethod.GET, "/api/v1/subastas").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/subastas/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/subastas/*/catalogo").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/subastas/*/catalogo/items").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/subastas/*/catalogo/items/*").permitAll()
                        // [CLIENTES]
                        .requestMatchers("/api/v1/clientes/*").authenticated()
                        // [PRODUCTOS]
                        .requestMatchers(HttpMethod.GET, "/productos/*").permitAll()
                        .requestMatchers("/productos/*/fotos/*/content").permitAll()
                        // [ERROR]
                        .requestMatchers("/error").permitAll()
                        // [WS] (Auth en WebSocketConfig)
                        .requestMatchers("/api/v1/ws/**").permitAll()
                        // [DOCS]
                        .requestMatchers(
                                "/api-docs/**",
                                "/api-docs/swagger-config",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/docs")
                        .permitAll()
                        // [ACTUATOR]
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/actuator/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
