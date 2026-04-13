package fabriziob.com.subastapp.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import fabriziob.com.subastapp.entity.Cliente;
import fabriziob.com.subastapp.repository.ClienteRepository;
import jakarta.persistence.EntityNotFoundException;

@Service
@RequiredArgsConstructor
@Transactional
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Transactional(readOnly = true)
    public Cliente findById(Integer id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public Page<Cliente> findAll(Pageable pageable) {
        return clienteRepository.findAll(pageable);
    }
}