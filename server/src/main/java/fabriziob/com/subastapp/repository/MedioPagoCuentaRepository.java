package fabriziob.com.subastapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.MedioPagoCuenta;

@Repository
public interface MedioPagoCuentaRepository extends JpaRepository<MedioPagoCuenta, Integer> {
}
