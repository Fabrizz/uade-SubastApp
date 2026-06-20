package fabriziob.com.subastapp.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    // Listado con filtros opcionales (cualquier combinación de estado/categoria/fecha) + paginado.
    @Query("""
            SELECT s FROM Subasta s
            WHERE (:estado IS NULL OR s.estado = :estado)
              AND (:categoria IS NULL OR s.categoria = :categoria)
              AND (:fecha IS NULL OR s.fecha = :fecha)
            """)
    Page<Subasta> buscar(@Param("estado") EstadoSubasta estado,
            @Param("categoria") CategoriaSubasta categoria,
            @Param("fecha") LocalDate fecha,
            Pageable pageable);

    @Query("""
            SELECT s FROM Subasta s
            LEFT JOIN FETCH s.subastaExtra e
            WHERE (:desde IS NULL OR s.fecha >= :desde)
              AND (:hasta IS NULL OR s.fecha <= :hasta)
              AND (:categoria IS NULL OR s.categoria = :categoria)
              AND (:moneda IS NULL OR e.moneda = :moneda)
            """)
    List<Subasta> findForGlobalStats(
            @Param("desde") java.time.LocalDate desde,
            @Param("hasta") java.time.LocalDate hasta,
            @Param("categoria") CategoriaSubasta categoria,
            @Param("moneda") fabriziob.com.subastapp.entity.enums.Moneda moneda);
}
