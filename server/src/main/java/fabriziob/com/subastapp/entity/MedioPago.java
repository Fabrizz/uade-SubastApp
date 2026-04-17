package fabriziob.com.subastapp.entity;

import fabriziob.com.subastapp.entity.enums.Moneda;
import fabriziob.com.subastapp.entity.enums.TipoMedioPago;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
@Table(name = "medios_pago")
public class MedioPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "cliente", nullable = false)
    private Integer cliente;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    private TipoMedioPago tipo;

    @Builder.Default
    @Column(name = "verificado", nullable = false)
    private Boolean verificado = true;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "moneda", nullable = false, length = 3)
    private Moneda moneda = Moneda.ARS;

    @Builder.Default
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}
