package fabriziob.com.subastapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.MedioPagoCheque;

@Repository
public interface MedioPagoChequeRepository extends JpaRepository<MedioPagoCheque, Integer> {
}
