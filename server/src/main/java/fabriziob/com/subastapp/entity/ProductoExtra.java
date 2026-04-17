package fabriziob.com.subastapp.entity;

import java.time.LocalDate;

import fabriziob.com.subastapp.entity.enums.EstadoBien;
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
@Table(name = "productos_extra")
public class ProductoExtra {

    @Id
    @Column(name = "identificador")
    private Integer identificador;

    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador")
    private Producto producto;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "estadobien", nullable = false, length = 15)
    private EstadoBien estadoBien = EstadoBien.recibido;

    @Column(name = "motivorechazo", length = 500)
    private String motivoRechazo;

    @Builder.Default
    @Column(name = "declaracionpropiedad", nullable = false)
    private Boolean declaracionPropiedad = false;

    @Builder.Default
    @Column(name = "espiezamultiple", nullable = false)
    private Boolean esPiezaMultiple = false;

    @Column(name = "cantidadpiezas")
    private Integer cantidadPiezas;

    @Builder.Default
    @Column(name = "esobradearte", nullable = false)
    private Boolean esObraDeArte = false;

    @Column(name = "artista", length = 200)
    private String artista;

    @Column(name = "fechacreacionobra")
    private LocalDate fechaCreacionObra;

    @Column(name = "historia", columnDefinition = "TEXT")
    private String historia;

    @Column(name = "deposito", length = 250)
    private String deposito;
}
