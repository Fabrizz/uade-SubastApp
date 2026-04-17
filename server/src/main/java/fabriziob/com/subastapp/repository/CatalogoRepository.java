package fabriziob.com.subastapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.Catalogo;

@Repository
public interface CatalogoRepository extends JpaRepository<Catalogo, Integer> {

    List<Catalogo> findBySubasta_Identificador(Integer subastaId);

    List<Catalogo> findByResponsable_Identificador(Integer empleadoId);

    @Query("SELECT c FROM Catalogo c LEFT JOIN FETCH c.items WHERE c.identificador = :id")
    Optional<Catalogo> findByIdWithItems(@Param("id") Integer id);

    @Query("SELECT c FROM Catalogo c LEFT JOIN FETCH c.items WHERE c.subasta.identificador = :subastaId")
    List<Catalogo> findBySubastaIdWithItems(@Param("subastaId") Integer subastaId);
}
