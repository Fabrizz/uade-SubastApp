package fabriziob.com.subastapp.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.MedioPagoCheque;
import fabriziob.com.subastapp.entity.enums.Moneda;

@Repository
public interface MedioPagoChequeRepository extends JpaRepository<MedioPagoCheque, Integer> {

    /**
     * Cheques de un cliente que están activos, verificados, en la moneda dada
     * y con fecha de vencimiento posterior o igual a la fecha de la subasta.
     * Útil para calcular la garantía disponible al pujar.
     */
    @Query("""
            SELECT c FROM MedioPagoCheque c
            WHERE c.medioPago.cliente = :clienteId
              AND c.medioPago.activo = true
              AND c.medioPago.verificado = true
              AND c.medioPago.moneda = :moneda
              AND c.fechaVencimiento >= :fechaSubasta
            """)
    List<MedioPagoCheque> findVigentesByCliente(
            @Param("clienteId") Integer clienteId,
            @Param("moneda") Moneda moneda,
            @Param("fechaSubasta") LocalDate fechaSubasta);
}
