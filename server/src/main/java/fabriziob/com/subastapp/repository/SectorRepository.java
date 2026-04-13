package fabriziob.com.subastapp.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.Sector;

@Repository
public interface SectorRepository extends JpaRepository<Sector, Integer> {
    Page<Sector> findAll(Pageable pageable);
}
