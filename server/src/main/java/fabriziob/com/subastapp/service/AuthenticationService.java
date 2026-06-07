package fabriziob.com.subastapp.service;

import java.util.Arrays;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.config.JwtService;
import fabriziob.com.subastapp.controller.auth.AuthenticationRequest;
import fabriziob.com.subastapp.controller.auth.AuthenticationResponse;
import fabriziob.com.subastapp.controller.auth.PreRegisterRequest;
import fabriziob.com.subastapp.controller.auth.PreRegisterResponse;
import fabriziob.com.subastapp.controller.auth.RegisterRequest;
import fabriziob.com.subastapp.entity.Cliente;
import fabriziob.com.subastapp.entity.ClienteExtra;
import fabriziob.com.subastapp.entity.Pais;
import fabriziob.com.subastapp.entity.Persona;
import fabriziob.com.subastapp.entity.PersonaExtra;
import fabriziob.com.subastapp.entity.enums.ClienteCategoria;
import fabriziob.com.subastapp.entity.enums.EstadoPersona;
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

        private final ClienteService clienteService;

        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        @Value("${app.empleado-sistema-id:1}")
        private Integer empleadoSistemaId;

        @Value("${app.admins-emails:}")
        private String adminsEmails;

        // ─── PRE-REGISTER ────────────────────────────────────────────────────

        public PreRegisterResponse preRegister(PreRegisterRequest request) {

                if (personaExtraRepository.existsByEmail(request.getEmail()))
                        throw new RuntimeException("Email ya registrado: " + request.getEmail());

                boolean esAdmin = !adminsEmails.isBlank() &&
                                Arrays.stream(adminsEmails.split(","))
                                                .map(String::trim)
                                                .anyMatch(request.getEmail()::equalsIgnoreCase);

                // 1. Persona base — estado inactivo hasta que complete el paso 2
                Persona persona = Persona.builder()
                                .nombre(request.getNombre())
                                .documento(request.getDocumento())
                                .direccion(request.getDireccion())
                                .estado(EstadoPersona.inactivo)
                                .build();

                persona = userRepository.save(persona);

                // 2. PersonaExtra — la clave temporal se genera y envía recién al admitir
                PersonaExtra personaExtra = new PersonaExtra();
                personaExtra.setPersona(persona);
                personaExtra.setEmail(request.getEmail());
                personaExtra.setTelefono(request.getTelefono());
                personaExtra.setPasswordTemporal(true);
                personaExtra = personaExtraRepository.save(personaExtra);
                persona.setPersonaExtra(personaExtra);

                // 3. Cliente — admitido=no hasta la investigación externa (endpoint /admitir)
                Pais pais = paisRepository.findById(request.getNumeroPais())
                                .orElseThrow(() -> new RuntimeException(
                                                "País no encontrado: " + request.getNumeroPais()));

                Cliente cliente = Cliente.builder()
                                .persona(persona)
                                .pais(pais)
                                .admitido("no")
                                .categoria(esAdmin ? ClienteCategoria.admin : ClienteCategoria.comun)
                                .verificador(empleadoSistemaId)
                                .build();

                cliente = clienteRepository.save(cliente);
                persona.setCliente(cliente);

                // 4. ClienteExtra — inhabilitado y con fotos del documento hasta que la empresa
                // apruebe
                ClienteExtra clienteExtra = new ClienteExtra();
                clienteExtra.setCliente(cliente);
                clienteExtra.setEstadoOperativo(esAdmin ? "habilitado" : "inhabilitado");
                clienteExtra.setMultaPendiente(null);
                clienteExtra.setFotoDocumentoFrente(decodeBase64(request.getFotoFrenteDocumento()));
                clienteExtra.setFotoDocumentoDorso(decodeBase64(request.getFotoDorsoDocumento()));
                clienteExtraRepository.save(clienteExtra);

                if (esAdmin)
                        clienteService.admitir(cliente.getIdentificador());

                return PreRegisterResponse.builder()
                                .email(request.getEmail())
                                .mensaje("Pre-registro recibido. Su identidad está siendo verificada; "
                                                + "recibirá un mail cuando sea aprobado.")
                                .build();
        }

        private byte[] decodeBase64(String value) {
                if (value == null || value.isBlank())
                        return null;
                // Tolera el prefijo data URL ("data:image/png;base64,...")
                String payload = value.contains(",") ? value.substring(value.indexOf(',') + 1) : value;
                return Base64.getDecoder().decode(payload);
        }

        // ─── REGISTER (paso 2) ───────────────────────────────────────────────

        public AuthenticationResponse register(RegisterRequest request) {

                PersonaExtra personaExtra = personaExtraRepository
                                .findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

                if (!personaExtra.getPasswordTemporal())
                        throw new RuntimeException("El usuario ya completó el registro");

                if (!passwordEncoder.matches(request.getTemporaryPassword(), personaExtra.getPasswordHash()))
                        throw new RuntimeException("Contraseña temporal incorrecta");

                // Setear la nueva contraseña y liberar el flag
                personaExtra.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
                personaExtra.setPasswordTemporal(false);
                personaExtraRepository.save(personaExtra);

                // Activar la persona
                Persona persona = personaExtra.getPersona();
                persona.setEstado(EstadoPersona.activo);
                userRepository.save(persona);

                var jwtToken = jwtService.generateToken(persona);
                return AuthenticationResponse.builder()
                                .accessToken(jwtToken)
                                .categoria(persona.getCliente().getCategoria().name())
                                .build();
        }

        // ─── AUTHENTICATE ────────────────────────────────────────────────────

        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                Persona persona = userRepository.findByPersonaExtra_Email(request.getEmail())
                                .orElseThrow();

                // Bloquear login si aún no completó el paso 2
                PersonaExtra personaExtra = personaExtraRepository
                                .findByEmail(request.getEmail())
                                .orElseThrow();

                if (personaExtra.getPasswordTemporal())
                        throw new RuntimeException("Debe completar el registro antes de iniciar sesión");

                var jwtToken = jwtService.generateToken(persona);
                return AuthenticationResponse.builder()
                                .accessToken(jwtToken)
                                .categoria(persona.getCliente() != null
                                                ? persona.getCliente().getCategoria().name()
                                                : null)
                                .build();
        }

        // ─── HELPERS ─────────────────────────────────────────────────────────

        public boolean emailDisponible(String email) {
                return !personaExtraRepository.existsByEmail(email);
        }
}