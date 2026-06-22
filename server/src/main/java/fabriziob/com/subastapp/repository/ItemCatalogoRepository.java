package fabriziob.com.subastapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.ItemCatalogo;
import fabriziob.com.subastapp.entity.enums.EstadoAceptacionItem;

@Repository
public interface ItemCatalogoRepository extends JpaRepository<ItemCatalogo, Integer> {

    List<ItemCatalogo> findByCatalogo_Identificador(Integer catalogoId);

    List<ItemCatalogo> findByProducto_Identificador(Integer productoId);

    List<ItemCatalogo> findBySubastado(String subastado);

    @Query("SELECT i FROM ItemCatalogo i LEFT JOIN FETCH i.producto WHERE i.catalogo.identificador = :catalogoId")
    List<ItemCatalogo> findByCatalogoIdWithProducto(@Param("catalogoId") Integer catalogoId);

    @Query("SELECT COUNT(i) FROM ItemCatalogo i WHERE i.catalogo.subasta.identificador = :subastaId")
    long countBySubastaId(@Param("subastaId") Integer subastaId);

    @Query("""
            SELECT COUNT(i) FROM ItemCatalogo i
            WHERE i.catalogo.subasta.identificador = :subastaId
              AND i.estadoAceptacion = :estado
            """)
    long countBySubastaIdAndEstadoAceptacion(
            @Param("subastaId") Integer subastaId,
            @Param("estado") EstadoAceptacionItem estado);

    @Query("""
            SELECT i FROM ItemCatalogo i
            LEFT JOIN FETCH i.producto
            WHERE i.catalogo.subasta.identificador = :subastaId
              AND i.estadoAceptacion = :estado
              AND (i.subastado IS NULL OR i.subastado = 'no')
            ORDER BY i.identificador ASC
            """)
    List<ItemCatalogo> findFirstBySubastaIdAndEstadoAceptacionAndNoSubastado(
            @Param("subastaId") Integer subastaId,
            @Param("estado") EstadoAceptacionItem estado);
}