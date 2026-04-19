package fabriziob.com.subastapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.RegistroDeSubastaExtra;
import fabriziob.com.subastapp.entity.enums.EstadoPagoDuenio;
import fabriziob.com.subastapp.entity.enums.MedioEnvio;

@Repository
public interface RegistroDeSubastaExtraRepository extends JpaRepository<RegistroDeSubastaExtra, Integer> {

    Optional<RegistroDeSubastaExtra> findByRegistroSubasta_Identificador(Integer registroSubastaId);

    boolean existsByRegistroSubasta_Identificador(Integer registroSubastaId);

    List<RegistroDeSubastaExtra> findByEstadoPagoDuenio(EstadoPagoDuenio estado);

    List<RegistroDeSubastaExtra> findByMedioEnvio(MedioEnvio medioEnvio);

    List<RegistroDeSubastaExtra> findByCuentaCobroDuenio_Identificador(Integer cuentaId);

    @Query("""
            SELECT r FROM RegistroDeSubastaExtra r
            LEFT JOIN FETCH r.registroSubasta rs
            LEFT JOIN FETCH r.cuentaCobroDuenio
            LEFT JOIN FETCH r.paisEnvio
            WHERE rs.subasta.identificador = :subastaId
            """)
    List<RegistroDeSubastaExtra> findBySubastaId(@Param("subastaId") Integer subastaId);

    @Query("""
            SELECT r FROM RegistroDeSubastaExtra r
            LEFT JOIN FETCH r.registroSubasta rs
            WHERE rs.subasta.identificador = :subastaId
            AND r.estadoPagoDuenio = :estado
            """)
    List<RegistroDeSubastaExtra> findBySubastaIdAndEstado(
            @Param("subastaId") Integer subastaId,
            @Param("estado") EstadoPagoDuenio estado);
}
