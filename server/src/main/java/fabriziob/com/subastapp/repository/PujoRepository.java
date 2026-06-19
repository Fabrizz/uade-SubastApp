package fabriziob.com.subastapp.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.Pujo;
import fabriziob.com.subastapp.entity.enums.Moneda;

@Repository
public interface PujoRepository extends JpaRepository<Pujo, Integer> {

    List<Pujo> findByItem_Identificador(Integer itemId);

    List<Pujo> findByAsistente_Identificador(Integer asistenteId);

    long countByAsistente_Cliente_Identificador(Integer clienteId);

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

    @Query("""
            SELECT MAX(p.importe) FROM Pujo p
            WHERE p.item.identificador = :itemId
            """)
    Optional<BigDecimal> findMaxImporteByItem(@Param("itemId") Integer itemId);

    /**
     * Suma de pujos ganadores del cliente cuya venta aún no está confirmada,
     * en la moneda de las subastas correspondientes. Se usa para calcular la
     * garantía consumida cuando el cliente sólo opera con cheques certificados.
     *
     * Un pujo se considera "consumiendo garantía" si:
     *  - ganador = 'si', y
     *  - no existe RegistroDeSubasta correspondiente (producto+subasta+cliente)
     *    con estado_pago_duenio = confirmado.
     */
    @Query("""
            SELECT COALESCE(SUM(p.importe), 0) FROM Pujo p
            WHERE p.ganador = 'si'
              AND p.asistente.cliente.identificador = :clienteId
              AND p.item.catalogo.subasta.subastaExtra.moneda = :moneda
              AND NOT EXISTS (
                SELECT 1 FROM RegistroDeSubasta r
                WHERE r.cliente.identificador = p.asistente.cliente.identificador
                  AND r.producto.identificador = p.item.producto.identificador
                  AND r.subasta.identificador = p.item.catalogo.subasta.identificador
                  AND r.extra.estadoPagoDuenio = fabriziob.com.subastapp.entity.enums.EstadoPagoDuenio.confirmado
              )
            """)
    BigDecimal sumImporteGanadorPendienteByCliente(
            @Param("clienteId") Integer clienteId,
            @Param("moneda") Moneda moneda);

    @Query("SELECT COUNT(DISTINCT a.subasta.identificador) FROM Pujo p JOIN p.asistente a WHERE a.cliente.identificador = :clienteId")
    long countUniqueSubastasByClienteId(@Param("clienteId") Integer clienteId);

    @Query("SELECT COUNT(DISTINCT a.subasta.identificador) FROM Pujo p JOIN p.asistente a WHERE a.cliente.identificador = :clienteId AND p.ganador = 'si'")
    long countUniqueSubastasGanadasByClienteId(@Param("clienteId") Integer clienteId);

    @Query("SELECT COUNT(DISTINCT p.asistente.cliente.identificador) FROM Pujo p WHERE p.asistente.subasta.identificador = :subastaId")
    long countUniqueBiddersBySubastaId(@Param("subastaId") Integer subastaId);

    @Query("SELECT DISTINCT p.asistente.cliente.identificador FROM Pujo p WHERE p.asistente.subasta.identificador = :subastaId")
    List<Integer> findUniqueBidderIdsBySubastaId(@Param("subastaId") Integer subastaId);

    @Query("SELECT COALESCE(SUM(p.importe), 0) FROM Pujo p WHERE p.asistente.cliente.identificador = :clienteId")
    BigDecimal sumImporteByClienteId(@Param("clienteId") Integer clienteId);

    @Query("SELECT COALESCE(SUM(p.importe), 0) FROM Pujo p WHERE p.asistente.cliente.identificador = :clienteId AND p.ganador = 'si'")
    BigDecimal sumImporteGanadorByClienteId(@Param("clienteId") Integer clienteId);

    @Query("SELECT COALESCE(AVG(p.importe), 0.0) FROM Pujo p WHERE p.asistente.cliente.identificador = :clienteId")
    Double averageImporteByClienteId(@Param("clienteId") Integer clienteId);
}
