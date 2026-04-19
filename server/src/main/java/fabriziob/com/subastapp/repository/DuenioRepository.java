package fabriziob.com.subastapp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.Duenio;

@Repository
public interface DuenioRepository extends JpaRepository<Duenio, Integer> {

    @Query("""
            SELECT d FROM Duenio d
            LEFT JOIN FETCH d.persona p
            LEFT JOIN FETCH p.personaExtra
            LEFT JOIN FETCH d.pais
            LEFT JOIN FETCH d.verificador
            WHERE d.identificador = :id
            """)
    Optional<Duenio> findByIdWithAll(@Param("id") Integer id);
}
