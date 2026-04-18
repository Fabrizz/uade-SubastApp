package fabriziob.com.subastapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.Asistente;

@Repository
public interface AsistenteRepository extends JpaRepository<Asistente, Integer> {

    List<Asistente> findBySubasta_Identificador(Integer subastaId);

    List<Asistente> findByCliente_Identificador(Integer clienteId);

    Optional<Asistente> findByCliente_IdentificadorAndSubasta_Identificador(Integer clienteId, Integer subastaId);

    boolean existsByCliente_IdentificadorAndSubasta_Identificador(Integer clienteId, Integer subastaId);
}
