package fabriziob.com.subastapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.Subasta;
import fabriziob.com.subastapp.entity.enums.CategoriaSubasta;
import fabriziob.com.subastapp.entity.enums.EstadoSubasta;

@Repository
public interface SubastaRepository extends JpaRepository<Subasta, Integer> {

    List<Subasta> findByEstado(EstadoSubasta estado);

    List<Subasta> findByCategoria(CategoriaSubasta categoria);

    List<Subasta> findBySubastador_Identificador(Integer subastadorId);

    @Query("SELECT s FROM Subasta s LEFT JOIN FETCH s.subastaExtra WHERE s.identificador = :id")
    Optional<Subasta> findByIdWithExtra(@Param("id") Integer id);
}
