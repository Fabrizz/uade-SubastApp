package fabriziob.com.subastapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "empleados")
public class Empleado {

    @Id
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "cargo", length = 100)
    private String cargo;

    // Columna raw para escritura
    @Column(name = "sector")
    private Integer sector;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sector", insertable = false, updatable = false)
    private Sector sectorObj;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "identificador")
    private Persona persona;
}
