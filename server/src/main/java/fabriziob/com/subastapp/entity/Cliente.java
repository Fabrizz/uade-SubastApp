package fabriziob.com.subastapp.entity;

import java.util.List;

import fabriziob.com.subastapp.entity.enums.ClienteCategoria;
import fabriziob.com.subastapp.entity.enums.EstadoPersona;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany;
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
@Table(name = "clientes")
public class Cliente {

    @Id
    @Column(name = "identificador")
    private Integer identificador;

    // -------------------------------------------------------
    // Columnas propias
    // -------------------------------------------------------

    @Column(name = "admitido", length = 2)
    private String admitido; // 'si' / 'no'

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", length = 15)
    private ClienteCategoria categoria;

    // -------------------------------------------------------
    // Relaciones
    // -------------------------------------------------------

    // Herencia: Cliente ES una Persona (FK compartida como PK)
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId // le dice a JPA que el PK de Cliente
    @JoinColumn(name = "identificador") // es el mismo que el de Persona
    private Persona persona;

    // El empleado que verificó / aprobó al cliente
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "verificador", nullable = false)
    // private Empleado verificador;

    // País de origen del cliente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "numeropais", columnDefinition = "INT")
    private Pais pais;

    // Datos extra (estado operativo, multa)
    @OneToOne(mappedBy = "cliente", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private ClienteExtra clienteExtra;

    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente")
    private List<MedioPago> mediosPago;
}