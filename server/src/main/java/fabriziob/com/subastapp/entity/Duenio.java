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

    @Column(name = "numeropais")
    private Integer numeroPais;

    @Column(name = "verificacionfinanciera", length = 2)
    private String verificacionFinanciera;

    @Column(name = "verificacionjudicial", length = 2)
    private String verificacionJudicial;

    @Column(name = "calificacionriesgo")
    private Integer calificacionRiesgo;

    @Column(name = "verificador")
    private Integer verificador;

    // Navegación
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "identificador")
    private Persona persona;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "numeropais", insertable = false, updatable = false)
    private Pais pais;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verificador", insertable = false, updatable = false)
    private Empleado empleadoVerificador;
}