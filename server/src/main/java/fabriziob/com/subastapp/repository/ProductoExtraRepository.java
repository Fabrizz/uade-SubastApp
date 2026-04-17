package fabriziob.com.subastapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fabriziob.com.subastapp.entity.ProductoExtra;

@Repository
public interface ProductoExtraRepository extends JpaRepository<ProductoExtra, Integer> {
}
