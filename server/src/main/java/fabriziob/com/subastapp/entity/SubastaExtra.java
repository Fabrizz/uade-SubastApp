package fabriziob.com.subastapp.entity;

import fabriziob.com.subastapp.entity.enums.EstadoDetalladoSubasta;
import fabriziob.com.subastapp.entity.enums.Moneda;
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
@Table(name = "subastas_extra")
public class SubastaExtra {

    @Id
    @Column(name = "identificador")
    private Integer identificador;

    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador")
    private Subasta subasta;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "moneda", nullable = false, length = 3)
    private Moneda moneda = Moneda.ARS;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "estadodetallado", nullable = false, length = 15)
    private EstadoDetalladoSubasta estadoDetallado = EstadoDetalladoSubasta.creada;

    @Builder.Default
    @Column(name = "escoleccion", nullable = false)
    private Boolean esColeccion = false;

    @Column(name = "nombrecoleccion", length = 200)
    private String nombreColeccion;
}
