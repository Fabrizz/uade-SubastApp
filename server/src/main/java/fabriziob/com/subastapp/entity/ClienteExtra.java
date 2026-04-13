package fabriziob.com.subastapp.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "clientes_extra")
public class ClienteExtra {

    @Id
    @Column(name = "identificador")
    private Integer identificador;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "identificador")
    private Cliente cliente; // ← el lado dueño de la relación

    @Column(name = "estadooperativo")
    private String estadoOperativo;

    @Column(name = "multapendiente")
    private BigDecimal multaPendiente;
}