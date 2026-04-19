package fabriziob.com.subastapp.controller.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fabriziob.com.subastapp.exception.UserDuplicateException;
import fabriziob.com.subastapp.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * Controlador para la autenticacion de usuarios
 * Permite registrar y autenticar usuarios
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints para registro y login de usuarios")
public class AuthenticationController {

        private final AuthenticationService service;

        @Operation(summary = "Registrar usuario", description = "Crea un nuevo usuario en el sistema")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Usuario registrado correctamente"),
                        @ApiResponse(responseCode = "409", description = "El usuario ya existe")
        })
        @PostMapping("/register")
        public ResponseEntity<AuthenticationResponse> register(
                        @RequestBody RegisterRequest request) throws UserDuplicateException {
                return ResponseEntity.ok(service.register(request));
        }

        @Operation(summary = "Autenticar usuario", description = "Valida credenciales y devuelve el token / categoría del usuario")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Autenticación exitosa"),
                        @ApiResponse(responseCode = "401", description = "Credenciales inválidas")
        })
        @PostMapping("/authenticate")
        public ResponseEntity<AuthenticationResponse> authenticate(
                        @RequestBody AuthenticationRequest request) {
                return ResponseEntity.ok(service.authenticate(request));
        }

        @Operation(summary = "Verificar disponibilidad de correo", description = "Verifica si un correo electrónico está disponible para registro")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Correo disponible"),
                        @ApiResponse(responseCode = "409", description = "El correo ya está en uso")
        })
        @PostMapping("/check")
        public ResponseEntity<Void> check(@RequestBody CheckRequest request) {
                boolean available = service.emailDisponible(request.getEmail());

                return available
                                ? ResponseEntity.noContent().build()
                                : ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
}