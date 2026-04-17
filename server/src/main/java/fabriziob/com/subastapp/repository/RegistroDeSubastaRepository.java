package fabriziob.com.subastapp.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.RegistroDeSubasta;

@Repository
public interface RegistroDeSubastaRepository extends JpaRepository<RegistroDeSubasta, Integer> {

    List<RegistroDeSubasta> findBySubasta_Identificador(Integer subastaId);

    List<RegistroDeSubasta> findByCliente_Identificador(Integer clienteId);

    List<RegistroDeSubasta> findByDuenio_Identificador(Integer duenioId);

    List<RegistroDeSubasta> findByProducto_Identificador(Integer productoId);

    @Query("""
            SELECT r FROM RegistroDeSubasta r
            LEFT JOIN FETCH r.subasta
            LEFT JOIN FETCH r.cliente
            LEFT JOIN FETCH r.duenio
            LEFT JOIN FETCH r.producto
            WHERE r.subasta.identificador = :subastaId
            """)
    List<RegistroDeSubasta> findBySubastaIdWithAll(@Param("subastaId") Integer subastaId);
}
