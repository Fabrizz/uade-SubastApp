package fabriziob.com.subastapp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.Persona;

@Repository
public interface UserRepository extends JpaRepository<Persona, Integer> {
    Optional<Persona> findByPersonaExtra_Email(String email);
}