package fabriziob.com.subastapp.entity;

import fabriziob.com.subastapp.entity.enums.CajaAhorroTipoCuenta;
import fabriziob.com.subastapp.entity.enums.EstadoAceptacionItem;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "medios_pago_cuenta")
public class MedioPagoCuenta {

    @Id
    @Column(name = "identificador")
    private Integer identificador;

    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador")
    private MedioPago medioPago;

    @Column(name = "titular", nullable = false, length = 150)
    private String titular;

    @Column(name = "banco", nullable = false, length = 150)
    private String banco;

    @Column(name = "cbu", length = 50)
    private String cbu;

    @Column(name = "alias", length = 50)
    private String alias;

    @Builder.Default
    @Column(name = "esexterior", nullable = false)
    private Boolean esExterior = false;

    @Column(name = "iban", length = 50)
    private String iban;

    @Column(name = "pais")
    private Integer pais;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "tipodecuenta", nullable = false, length = 15)
    private CajaAhorroTipoCuenta tipoDeCuenta = CajaAhorroTipoCuenta.caja_ahorro;
}
