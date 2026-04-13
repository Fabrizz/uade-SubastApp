package fabriziob.com.subastapp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.Pais;

@Repository
public interface PaisRepository extends JpaRepository<Pais, Integer> {
    Optional<Pais> findByNombre(String nombre);
}