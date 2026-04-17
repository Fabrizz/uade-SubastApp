package fabriziob.com.subastapp.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.SubastaExtra;
import fabriziob.com.subastapp.entity.enums.EstadoDetalladoSubasta;
import fabriziob.com.subastapp.entity.enums.Moneda;

@Repository
public interface SubastaExtraRepository extends JpaRepository<SubastaExtra, Integer> {

    List<SubastaExtra> findByEstadoDetallado(EstadoDetalladoSubasta estado);

    List<SubastaExtra> findByMoneda(Moneda moneda);

    List<SubastaExtra> findByEsColeccionTrue();
}
