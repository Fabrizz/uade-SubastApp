package fabriziob.com.subastapp.entity;

import java.math.BigDecimal;

import fabriziob.com.subastapp.entity.enums.EstadoAceptacionItem;
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
@Table(name = "itemscatalogo")
public class ItemCatalogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalogo", nullable = false)
    private Catalogo catalogo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto", nullable = false)
    private Producto producto;

    @Column(name = "preciobase", nullable = false, precision = 18, scale = 2)
    private BigDecimal precioBase;

    @Column(name = "comision", nullable = false, precision = 18, scale = 2)
    private BigDecimal comision;

    @Column(name = "subastado", length = 2)
    private String subastado;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "estadoaceptacion", nullable = false, length = 15)
    private EstadoAceptacionItem estadoAceptacion = EstadoAceptacionItem.espera;
}
