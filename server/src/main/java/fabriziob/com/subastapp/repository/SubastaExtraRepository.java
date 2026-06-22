package fabriziob.com.subastapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.SubastaExtra;
import fabriziob.com.subastapp.entity.enums.EstadoDetalladoSubasta;
import fabriziob.com.subastapp.entity.enums.Moneda;

@Repository
public interface SubastaExtraRepository extends JpaRepository<SubastaExtra, Integer> {

    List<SubastaExtra> findByEstadoDetallado(EstadoDetalladoSubasta estado);

    List<SubastaExtra> findByMoneda(Moneda moneda);

    List<SubastaExtra> findByEsColeccionTrue();

    @Query("""
            SELECT e FROM SubastaExtra e
            JOIN FETCH e.subasta s
            JOIN FETCH e.itemActual
            WHERE e.estadoDetallado = fabriziob.com.subastapp.entity.enums.EstadoDetalladoSubasta.en_curso
              AND e.itemActual IS NOT NULL
              AND e.inicioItemActualTs IS NOT NULL
              AND e.fechaFin IS NOT NULL
              AND e.horaFin IS NOT NULL
            """)
    List<SubastaExtra> findActivasConItemVigente();
}
