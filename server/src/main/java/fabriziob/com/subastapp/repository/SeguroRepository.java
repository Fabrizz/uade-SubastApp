package fabriziob.com.subastapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.Seguro;

@Repository
public interface SeguroRepository extends JpaRepository<Seguro, String> {

}