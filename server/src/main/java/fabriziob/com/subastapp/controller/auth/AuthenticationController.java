package fabriziob.com.subastapp.controller.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fabriziob.com.subastapp.exception.UserDuplicateException;
import fabriziob.com.subastapp.service.AuthenticationService;
import lombok.RequiredArgsConstructor;

/**
 * Controlador para la autenticacion de usuarios
 * Permite registrar y autenticar usuarios
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request) throws UserDuplicateException {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/check")
    public ResponseEntity<AuthenticationResponse> check(
            @RequestBody CheckRequest request) throws UserDuplicateException {
        boolean exists = service.emailDisponible(request.getEmail());
        return exists ? ResponseEntity.status(204).body(null) : ResponseEntity.status(200).body(null);
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }
}