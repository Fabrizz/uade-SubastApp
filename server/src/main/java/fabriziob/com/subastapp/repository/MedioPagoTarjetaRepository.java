package fabriziob.com.subastapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.MedioPagoTarjeta;

@Repository
public interface MedioPagoTarjetaRepository extends JpaRepository<MedioPagoTarjeta, Integer> {
}
