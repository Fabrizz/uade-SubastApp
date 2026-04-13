package fabriziob.com.subastapp.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.Duenio;

@Repository
public interface DuenioRepository extends JpaRepository<Duenio, Integer> {
    Page<Duenio> findAll(Pageable pageable);
}
