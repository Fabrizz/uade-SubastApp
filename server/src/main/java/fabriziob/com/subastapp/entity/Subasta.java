package fabriziob.com.subastapp.entity;

import java.time.LocalDate;
import java.time.LocalTime;

import fabriziob.com.subastapp.entity.enums.CategoriaSubasta;
import fabriziob.com.subastapp.entity.enums.EstadoSubasta;
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
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "subastas")
public class Subasta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "hora", nullable = false)
    private LocalTime hora;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 10)
    private EstadoSubasta estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subastador", nullable = true)
    private Subastador subastador;

    @Column(name = "ubicacion", length = 350)
    private String ubicacion;

    @Column(name = "capacidadasistentes")
    private Integer capacidadAsistentes;

    @Column(name = "tienedeposito", length = 2)
    private String tieneDeposito;

    @Column(name = "seguridadpropia", length = 2)
    private String seguridadPropia;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", length = 10)
    private CategoriaSubasta categoria;

    @OneToOne(mappedBy = "subasta", fetch = FetchType.LAZY)
    private SubastaExtra subastaExtra;
}
