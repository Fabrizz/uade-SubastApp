package fabriziob.com.subastapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.Subastador;

@Repository
public interface SubastadorRepository extends JpaRepository<Subastador, Integer> {
}