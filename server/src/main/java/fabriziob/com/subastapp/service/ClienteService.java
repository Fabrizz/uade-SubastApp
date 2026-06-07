package fabriziob.com.subastapp.service;

import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import fabriziob.com.subastapp.entity.Cliente;
import fabriziob.com.subastapp.entity.ClienteExtra;
import fabriziob.com.subastapp.entity.PersonaExtra;
import fabriziob.com.subastapp.entity.enums.ClienteCategoria;
import fabriziob.com.subastapp.repository.ClienteRepository;
import jakarta.persistence.EntityNotFoundException;

@Service
@RequiredArgsConstructor
@Transactional
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final WsNotificacionService wsNotificacionService;

    @Transactional(readOnly = true)
    public Cliente findById(Integer id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public Page<Cliente> findAll(Pageable pageable) {
        return clienteRepository.findAll(pageable);
    }

    /**
     * Investigación externa simulada: acepta al cliente, le asigna una categoría
     * aleatoria ponderada, genera su clave temporal y le envía el mail de
     * bienvenida.
     */
    public Cliente admitir(Integer id) {
        Cliente cliente = findById(id);
        cliente.setAdmitido("si");

        ClienteExtra extra = cliente.getClienteExtra();
        if (extra != null) {
            extra.setCategoriaBase(cliente.getCategoria());
        }

        // Clave temporal: se genera al admitir y se envía por mail.
        PersonaExtra personaExtra = cliente.getPersona().getPersonaExtra();
        String claveTemporal = PasswordUtil.generateTemporary();
        personaExtra.setPasswordHash(passwordEncoder.encode(claveTemporal));
        personaExtra.setPasswordTemporal(true);

        emailService.enviarBienvenida(personaExtra.getEmail(), claveTemporal);

        return cliente;
    }

    /**
     * Override administrativo de la categoría. Pasa a ser el nuevo piso de la
     * mejora.
     */
    public Cliente actualizarCategoria(Integer id, String categoria) {
        ClienteCategoria nueva = parseCategoria(categoria);
        Cliente cliente = findById(id);
        cliente.setCategoria(nueva);
        ClienteExtra extra = cliente.getClienteExtra();
        if (extra != null)
            extra.setCategoriaBase(nueva);

        String email = cliente.getPersona().getPersonaExtra().getEmail();
        wsNotificacionService.enviar(
                email,
                WsNotificacionService.Tipo.category_update,
                "Categoría actualizada",
                "Tu categoría fue actualizada a " + nueva.name());

        return cliente;
    }

    private ClienteCategoria parseCategoria(String categoria) {
        try {
            return ClienteCategoria.valueOf(categoria);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new IllegalArgumentException(
                    "Categoría inválida: " + categoria
                            + ". Valores válidos: comun, especial, plata, oro, platino");
        }
    }

    public Cliente inhabilitar(Integer id) {
        Cliente cliente = findById(id);
        ClienteExtra extra = requireExtra(cliente);
        extra.setEstadoOperativo("inhabilitado");
        return cliente;
    }

    public Cliente habilitar(Integer id) {
        Cliente cliente = findById(id);
        ClienteExtra extra = requireExtra(cliente);
        if (extra.getMultaPendiente() != null && extra.getMultaPendiente().compareTo(BigDecimal.ZERO) > 0)
            throw new IllegalStateException(
                    "El cliente tiene una multa pendiente; debe saldarla antes de habilitarlo");
        extra.setEstadoOperativo("habilitado");
        return cliente;
    }

    public Cliente asignarMulta(Integer id, BigDecimal monto) {
        if (monto == null || monto.compareTo(BigDecimal.ZERO) <= 0)
            throw new IllegalArgumentException("El monto de la multa debe ser mayor a 0");
        Cliente cliente = findById(id);
        ClienteExtra extra = requireExtra(cliente);
        BigDecimal actual = extra.getMultaPendiente() == null ? BigDecimal.ZERO : extra.getMultaPendiente();
        extra.setMultaPendiente(actual.add(monto));
        extra.setEstadoOperativo("suspendido");
        return cliente;
    }

    public Cliente saldarMulta(Integer id) {
        Cliente cliente = findById(id);
        ClienteExtra extra = requireExtra(cliente);
        extra.setMultaPendiente(BigDecimal.ZERO);
        if ("suspendido".equals(extra.getEstadoOperativo()))
            extra.setEstadoOperativo("habilitado");
        return cliente;
    }

    private ClienteExtra requireExtra(Cliente cliente) {
        ClienteExtra extra = cliente.getClienteExtra();
        if (extra == null)
            throw new IllegalStateException(
                    "El cliente " + cliente.getIdentificador() + " no tiene clienteExtra asociado");
        return extra;
    }
}
