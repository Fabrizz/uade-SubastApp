package fabriziob.com.subastapp.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import fabriziob.com.subastapp.entity.Persona;
import fabriziob.com.subastapp.entity.PersonaExtra;
import fabriziob.com.subastapp.entity.enums.EstadoPersona;
import fabriziob.com.subastapp.repository.PersonaExtraRepository;
import fabriziob.com.subastapp.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class PersonaService {

    private final UserRepository userRepository;
    private final PersonaExtraRepository personaExtraRepository;

    @Transactional(readOnly = true)
    public Persona findById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Persona no encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public Page<Persona> findAll(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public PersonaExtra findByEmail(String email) {
        return personaExtraRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Email no encontrado: " + email));
    }

    public boolean emailDisponible(String email) {
        return !personaExtraRepository.existsByEmail(email);
    }

    public void desactivar(Integer id) {
        Persona persona = findById(id);
        persona.setEstado(EstadoPersona.inactivo);
        userRepository.save(persona);
    }
}
