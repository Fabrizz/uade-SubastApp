package fabriziob.com.subastapp.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.ItemCatalogo;

@Repository
public interface ItemCatalogoRepository extends JpaRepository<ItemCatalogo, Integer> {

    List<ItemCatalogo> findByCatalogo_Identificador(Integer catalogoId);

    List<ItemCatalogo> findByProducto_Identificador(Integer productoId);

    List<ItemCatalogo> findBySubastado(String subastado);

    @Query("SELECT i FROM ItemCatalogo i LEFT JOIN FETCH i.producto WHERE i.catalogo.identificador = :catalogoId")
    List<ItemCatalogo> findByCatalogoIdWithProducto(@Param("catalogoId") Integer catalogoId);
}