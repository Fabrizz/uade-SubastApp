package fabriziob.com.subastapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "sectores")
public class Sector {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "nombresector", length = 150, nullable = false)
    private String nombreSector;

    @Column(name = "codigosector", length = 10)
    private String codigoSector;

    // Columna raw para escritura
    @Column(name = "responsablesector")
    private Integer responsableSector;

    // Relación solo para navegación, no toca la columna
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsablesector", insertable = false, updatable = false)
    private Empleado responsable;
}
