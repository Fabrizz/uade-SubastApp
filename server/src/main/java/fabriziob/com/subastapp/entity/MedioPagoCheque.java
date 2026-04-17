package fabriziob.com.subastapp.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "medios_pago_cheque")
public class MedioPagoCheque {

    @Id
    @Column(name = "identificador")
    private Integer identificador;

    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador")
    private MedioPago medioPago;

    @Column(name = "nrocheque", nullable = false, length = 50)
    private String nroCheque;

    @Column(name = "banco", nullable = false, length = 150)
    private String banco;

    @Column(name = "montocertificado", nullable = false, precision = 18, scale = 2)
    private BigDecimal montoCertificado;

    @Column(name = "fechavencimiento", nullable = false)
    private LocalDate fechaVencimiento;
}
