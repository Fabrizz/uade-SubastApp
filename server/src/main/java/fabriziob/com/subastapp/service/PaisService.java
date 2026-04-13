package fabriziob.com.subastapp.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.entity.Pais;
import fabriziob.com.subastapp.repository.PaisRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PaisService {

    private final PaisRepository paisRepository;

    @Transactional(readOnly = true)
    public Page<Pais> findAll(Pageable pageable) {
        return paisRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Pais findById(Integer id) {
        return paisRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("País no encontrado: " + id));
    }

    public Pais create(Pais pais) {
        return paisRepository.save(pais);
    }

    public void delete(Integer id) {
        if (!paisRepository.existsById(id))
            throw new EntityNotFoundException("País no encontrado: " + id);
        paisRepository.deleteById(id);
    }
}
