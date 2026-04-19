package fabriziob.com.subastapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.AsistenciaActual;

@Repository
public interface AsistenciaActualRepository extends JpaRepository<AsistenciaActual, Integer> {

    List<AsistenciaActual> findByAsistente_Identificador(Integer asistenteId);

    List<AsistenciaActual> findByAsistente_IdentificadorAndEstado(Integer asistenteId, String estado);

    Optional<AsistenciaActual> findTopByAsistente_IdentificadorOrderByFechaHoraIngresoDesc(Integer asistenteId);

    @Query("""
            SELECT a FROM AsistenciaActual a
            LEFT JOIN FETCH a.asistente ast
            LEFT JOIN FETCH ast.cliente
            WHERE ast.subasta.identificador = :subastaId
            AND a.estado = 'activo'
            """)
    List<AsistenciaActual> findActivosBySubastaId(@Param("subastaId") Integer subastaId);

    @Query("""
            SELECT a FROM AsistenciaActual a
            LEFT JOIN FETCH a.asistente ast
            LEFT JOIN FETCH ast.cliente
            WHERE ast.subasta.identificador = :subastaId
            AND ast.cliente.identificador   = :clienteId
            AND a.estado = 'activo'
            """)
    Optional<AsistenciaActual> findActivaBySubastaIdAndClienteId(
            @Param("subastaId") Integer subastaId,
            @Param("clienteId") Integer clienteId);
}