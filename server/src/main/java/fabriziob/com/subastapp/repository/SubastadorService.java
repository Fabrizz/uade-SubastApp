package fabriziob.com.subastapp.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import fabriziob.com.subastapp.entity.Persona;
import fabriziob.com.subastapp.entity.Subastador;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubastadorService {

    private final SubastadorRepository subastadorRepository;
    private final UserRepository userRepository;

    public Page<Subastador> getAll(Pageable pageable) {
        return subastadorRepository.findAll(pageable);
    }

    public Optional<Subastador> getById(Integer id) {
        return subastadorRepository.findById(id);
    }

    public Subastador create(Integer identificador, String matricula, String region) {
        Persona persona = userRepository.findById(identificador)
                .orElseThrow(() -> new EntityNotFoundException("Persona no encontrada"));
        Subastador subastador = new Subastador();
        subastador.setIdentificador(identificador);
        subastador.setPersona(persona);
        subastador.setMatricula(matricula);
        subastador.setRegion(region);
        return subastadorRepository.save(subastador);
    }

    public Optional<Subastador> update(Integer id, String matricula, String region) {
        return subastadorRepository.findById(id).map(existing -> {
            existing.setMatricula(matricula);
            existing.setRegion(region);
            return subastadorRepository.save(existing);
        });
    }

    public boolean delete(Integer id) {
        if (!subastadorRepository.existsById(id))
            return false;
        subastadorRepository.deleteById(id);
        return true;
    }
}