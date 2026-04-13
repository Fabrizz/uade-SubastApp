package fabriziob.com.subastapp.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.controller.empleado.EmpleadoRequest;
import fabriziob.com.subastapp.controller.empleado.EmpleadoUpdateRequest;
import fabriziob.com.subastapp.entity.Empleado;
import fabriziob.com.subastapp.entity.Persona;
import fabriziob.com.subastapp.entity.PersonaExtra;
import fabriziob.com.subastapp.repository.EmpleadoRepository;
import fabriziob.com.subastapp.repository.PersonaExtraRepository;
import fabriziob.com.subastapp.repository.SectorRepository;
import fabriziob.com.subastapp.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepository;
    private final UserRepository userRepository;
    private final PersonaExtraRepository personaExtraRepository;
    private final SectorRepository sectorRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<Empleado> findAll(Pageable pageable) {
        return empleadoRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Empleado findById(Integer id) {
        return empleadoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empleado no encontrado: " + id));
    }

    public Empleado create(EmpleadoRequest request) {
        if (request.getSector() != null && !sectorRepository.existsById(request.getSector()))
            throw new EntityNotFoundException("Sector no encontrado: " + request.getSector());

        Persona persona = Persona.builder()
                .nombre(request.getNombre())
                .documento(request.getDocumento())
                .direccion(request.getDireccion())
                .estado(Persona.EstadoPersona.ACTIVO)
                .build();
        persona = userRepository.save(persona);

        PersonaExtra extra = new PersonaExtra();
        extra.setIdentificador(persona.getIdentificador());
        extra.setPersona(persona);
        extra.setEmail(request.getEmail());
        extra.setTelefono(request.getTelefono());
        extra.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        personaExtraRepository.save(extra);

        Empleado empleado = Empleado.builder()
                .identificador(persona.getIdentificador())
                .persona(persona)
                .cargo(request.getCargo())
                .sector(request.getSector())
                .build();

        return empleadoRepository.save(empleado);
    }

    public Empleado update(Integer id, EmpleadoUpdateRequest request) {
        Empleado empleado = findById(id);

        if (request.getCargo() != null)
            empleado.setCargo(request.getCargo());
        if (request.getSector() != null) {
            if (!sectorRepository.existsById(request.getSector()))
                throw new EntityNotFoundException("Sector no encontrado: " + request.getSector());
            empleado.setSector(request.getSector());
        }

        return empleadoRepository.save(empleado);
    }

    public void desactivar(Integer id) {
        Empleado empleado = findById(id);
        empleado.getPersona().setEstado(Persona.EstadoPersona.INACTIVO);
        userRepository.save(empleado.getPersona());
    }
}