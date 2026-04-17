package fabriziob.com.subastapp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.Cliente;

// ClienteRepository.java
@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    Optional<Cliente> findByPersona_Identificador(Integer id);

    @Query("SELECT c FROM Cliente c LEFT JOIN FETCH c.mediosPago WHERE c.identificador = :id")
    Optional<Cliente> findByIdWithMediosPago(@Param("id") Integer id);
}