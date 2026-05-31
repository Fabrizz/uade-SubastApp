package fabriziob.com.subastapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.MedioPago;

@Repository
public interface MedioPagoRepository extends JpaRepository<MedioPago, Integer> {
    List<MedioPago> findByCliente(Integer cliente);
}
