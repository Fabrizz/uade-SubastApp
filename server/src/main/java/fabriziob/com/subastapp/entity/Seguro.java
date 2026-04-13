package fabriziob.com.subastapp.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "seguros")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Seguro {

    @Id
    @Column(name = "nropoliza", length = 30)
    private String nroPoliza;

    @Column(name = "compania", length = 150, nullable = false)
    private String compania;

    @Column(name = "polizacombinada", length = 2)
    private String polizaCombinada;

    @Column(name = "importe", nullable = false, precision = 18, scale = 2)
    private BigDecimal importe;
}
