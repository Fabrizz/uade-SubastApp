package fabriziob.com.subastapp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.PersonaExtra;

@Repository
public interface PersonaExtraRepository extends JpaRepository<PersonaExtra, Integer> {
    Optional<PersonaExtra> findByEmail(String email);

    boolean existsByEmail(String email);
}