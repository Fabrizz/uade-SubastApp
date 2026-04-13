package fabriziob.com.subastapp.service;

import java.math.BigDecimal;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.config.JwtService;
import fabriziob.com.subastapp.controller.auth.AuthenticationRequest;
import fabriziob.com.subastapp.controller.auth.AuthenticationResponse;
import fabriziob.com.subastapp.controller.auth.RegisterRequest;
import fabriziob.com.subastapp.entity.Cliente;
import fabriziob.com.subastapp.entity.ClienteExtra;
import fabriziob.com.subastapp.entity.Pais;
import fabriziob.com.subastapp.entity.Persona;
import fabriziob.com.subastapp.entity.PersonaExtra;
import fabriziob.com.subastapp.repository.ClienteExtraRepository;
import fabriziob.com.subastapp.repository.ClienteRepository;
import fabriziob.com.subastapp.repository.PaisRepository;
import fabriziob.com.subastapp.repository.PersonaExtraRepository;
import fabriziob.com.subastapp.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PersonaExtraRepository personaExtraRepository;
    private final ClienteRepository clienteRepository;
    private final ClienteExtraRepository clienteExtraRepository;
    private final PaisRepository paisRepository;

    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {

        if (personaExtraRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email ya registrado: " + request.getEmail());

        // 1. Persona base
        Persona persona = Persona.builder()
                .nombre(request.getNombre())
                .documento(request.getDocumento())
                .direccion(request.getDireccion())
                .estado(Persona.EstadoPersona.ACTIVO)
                .build();

        persona = userRepository.save(persona);

        // 2. PersonaExtra (email + telefono + password)
        PersonaExtra personaExtra = new PersonaExtra();
        personaExtra.setIdentificador(persona.getIdentificador());
        personaExtra.setPersona(persona);
        personaExtra.setEmail(request.getEmail());
        personaExtra.setTelefono(request.getTelefono());
        personaExtra.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        personaExtraRepository.save(personaExtra);

        // 3. Cliente
        Pais pais = paisRepository.findById(request.getNumeroPais())
                .orElseThrow(() -> new RuntimeException("País no encontrado: " + request.getNumeroPais()));

        Cliente cliente = Cliente.builder()
                .identificador(persona.getIdentificador())
                .persona(persona)
                .pais(pais)
                .admitido("no")
                .categoria("comun")
                .build();

        clienteRepository.save(cliente);

        // 4. ClienteExtra
        ClienteExtra clienteExtra = new ClienteExtra();
        clienteExtra.setIdentificador(persona.getIdentificador());
        clienteExtra.setCliente(cliente);
        clienteExtra.setEstadoOperativo("habilitado");
        clienteExtra.setMultaPendiente(BigDecimal.ZERO);
        clienteExtraRepository.save(clienteExtra);

        var jwtToken = jwtService.generateToken(persona);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .categoria(cliente.getCategoria())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        Persona persona = userRepository.findByPersonaExtra_Email(request.getEmail())
                .orElseThrow();

        var jwtToken = jwtService.generateToken(persona);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .categoria(persona.getCliente() != null ? persona.getCliente().getCategoria() : null)
                .build();
    }

    public boolean emailDisponible(String email) {
        return !personaExtraRepository.existsByEmail(email);
    }
}