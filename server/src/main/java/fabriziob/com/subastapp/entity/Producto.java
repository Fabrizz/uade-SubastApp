package fabriziob.com.subastapp.entity;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
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
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "disponible", length = 2)
    private String disponible;

    @Column(name = "descripcioncatalogo", length = 500)
    private String descripcionCatalogo;

    @Column(name = "descripcioncompleta", nullable = false, length = 300)
    private String descripcionCompleta;

    @Column(name = "revisor", nullable = false)
    private Integer revisor;

    @Column(name = "duenio", nullable = false)
    private Integer duenio;

    @Column(name = "seguro", length = 30)
    private String seguro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seguro", referencedColumnName = "nropoliza", nullable = true, insertable = false, updatable = false)
    private Seguro seguroObj;

    // Solo trae los IDs de fotos, nunca el BYTEA
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "fotos", joinColumns = @JoinColumn(name = "producto"))
    @Column(name = "identificador")
    private List<Integer> fotosIds;

    @OneToOne(mappedBy = "producto", fetch = FetchType.LAZY)
    private ProductoExtra productoExtra;
}
