package fabriziob.com.subastapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.Foto;

@Repository
public interface FotoRepository extends JpaRepository<Foto, Integer> {
    List<Foto> findByProducto(Integer productoId);
}
