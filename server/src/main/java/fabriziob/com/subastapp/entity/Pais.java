package fabriziob.com.subastapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
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
@Table(name = "paises")
public class Pais {
    @Id
    @Column(name = "numero")
    private Integer numero; // PK manual, sin SERIAL

    @Column(name = "nombre", nullable = false, length = 250)
    private String nombre;

    @Column(name = "nombrecorto", length = 250)
    private String nombreCorto;

    @Column(name = "capital", nullable = false, length = 250)
    private String capital;

    @Column(name = "nacionalidad", nullable = false, length = 250)
    private String nacionalidad;

    @Column(name = "idiomas", nullable = false, length = 150)
    private String idiomas;

    // -------------------------------------------------------
    // Relaciones inversas
    // -------------------------------------------------------
    // @OneToMany(mappedBy = "pais", fetch = FetchType.LAZY)
    // private List<Cliente> clientes;
    // @OneToMany(mappedBy = "pais", fetch = FetchType.LAZY)
    // private List<Duenio> duenios;
}