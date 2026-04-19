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
@Table(name = "duenios")
public class Duenio {

    @Id
    @Column(name = "identificador")
    private Integer identificador;

    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador")
    private Persona persona;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "numeropais", nullable = true)
    private Pais pais;

    @Column(name = "verificacionfinanciera", length = 2)
    private String verificacionFinanciera;

    @Column(name = "verificacionjudicial", length = 2)
    private String verificacionJudicial;

    @Column(name = "calificacionriesgo")
    private Integer calificacionRiesgo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verificador", nullable = false)
    private Empleado verificador;
}