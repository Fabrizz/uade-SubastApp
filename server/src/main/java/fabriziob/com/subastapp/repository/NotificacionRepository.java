package fabriziob.com.subastapp.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.Notificacion;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Integer> {

    Page<Notificacion> findByDestinatario_Identificador(Integer personaId, Pageable pageable);

    Page<Notificacion> findByDestinatario_IdentificadorAndLeida(Integer personaId, Boolean leida, Pageable pageable);

    Page<Notificacion> findByDestinatario_IdentificadorAndTipo(Integer personaId, String tipo, Pageable pageable);

    long countByDestinatario_IdentificadorAndLeidaFalse(Integer personaId);

    @Modifying
    @Query("UPDATE Notificacion n SET n.leida = true WHERE n.destinatario.identificador = :personaId")
    void marcarTodasLeidas(@Param("personaId") Integer personaId);
}