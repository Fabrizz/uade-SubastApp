package fabriziob.com.subastapp.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import fabriziob.com.subastapp.entity.enums.EstadoPagoDuenio;
import fabriziob.com.subastapp.entity.enums.MedioEnvio;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "registro_de_subasta_extra")
public class RegistroDeSubastaExtra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @OneToOne
    @JoinColumn(name = "registro_subasta", nullable = false, unique = true)
    private RegistroDeSubasta registroSubasta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuenta_cobro_duenio", nullable = false)
    private MedioPagoCuenta cuentaCobroDuenio;

    @Column(name = "direccion_envio", length = 350)
    private String direccionEnvio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pais_envio", nullable = true)
    private Pais paisEnvio;

    @Default
    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pago_duenio", nullable = false, length = 15)
    private EstadoPagoDuenio estadoPagoDuenio = EstadoPagoDuenio.pendiente;

    @Column(name = "fecha_transferencia")
    private LocalDateTime fechaTransferencia;

    @Column(name = "importe_neto", precision = 18, scale = 2)
    private BigDecimal importeNeto;

    @Column(name = "costo_envio", precision = 18, scale = 2)
    private BigDecimal costoEnvio;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "medio_envio", nullable = false, length = 20)
    private MedioEnvio medioEnvio = MedioEnvio.RETIRO_DEPOSITO;
}