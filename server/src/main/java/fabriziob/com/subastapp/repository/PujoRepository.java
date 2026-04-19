package fabriziob.com.subastapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.Pujo;

@Repository
public interface PujoRepository extends JpaRepository<Pujo, Integer> {

    List<Pujo> findByItem_Identificador(Integer itemId);

    List<Pujo> findByAsistente_Identificador(Integer asistenteId);

    List<Pujo> findByItem_IdentificadorAndGanador(Integer itemId, String ganador);

    List<Pujo> findByAsistente_Subasta_Identificador(Integer subastaId);

    List<Pujo> findByAsistente_Cliente_IdentificadorAndAsistente_Subasta_Identificador(Integer clienteId,
            Integer subastaId);

    @Query("""
            SELECT p FROM Pujo p
            LEFT JOIN FETCH p.asistente a
            LEFT JOIN FETCH a.cliente
            LEFT JOIN FETCH p.item i
            LEFT JOIN FETCH i.catalogo c
            WHERE c.subasta.identificador = :subastaId
            AND i.identificador = :itemId
            ORDER BY p.importe DESC
            """)
    List<Pujo> findBySubastaIdAndItemId(
            @Param("subastaId") Integer subastaId,
            @Param("itemId") Integer itemId);

    @Query("""
            SELECT p FROM Pujo p
            LEFT JOIN FETCH p.asistente a
            LEFT JOIN FETCH a.cliente
            LEFT JOIN FETCH p.item
            WHERE a.subasta.identificador = :subastaId
            ORDER BY p.importe DESC
            """)
    List<Pujo> findBySubastaIdWithAll(@Param("subastaId") Integer subastaId);
}
