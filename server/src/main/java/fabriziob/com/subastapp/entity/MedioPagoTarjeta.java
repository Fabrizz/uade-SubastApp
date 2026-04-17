package fabriziob.com.subastapp.entity;

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
@Table(name = "medios_pago_tarjeta")
public class MedioPagoTarjeta {

    @Id
    @Column(name = "identificador")
    private Integer identificador;

    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador")
    private MedioPago medioPago;

    @Column(name = "titular", nullable = false, length = 150)
    private String titular;

    @Column(name = "ultimos4", nullable = false, length = 4)
    private String ultimos4;

    @Column(name = "marca", nullable = false, length = 20)
    private String marca;

    @Column(name = "vencimiento", nullable = false, length = 7)
    private String vencimiento; // MM/YYYY

    @Builder.Default
    @Column(name = "esinternacional", nullable = false)
    private Boolean esInternacional = false;
}
