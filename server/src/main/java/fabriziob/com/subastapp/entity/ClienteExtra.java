package fabriziob.com.subastapp.entity;

import java.math.BigDecimal;

import fabriziob.com.subastapp.entity.enums.ClienteCategoria;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
    private Cliente cliente;

    @Column(name = "estadooperativo")
    private String estadoOperativo;

    @Column(name = "multapendiente")
    private BigDecimal multaPendiente;

    @Column(name = "foto_documento_frente")
    private byte[] fotoDocumentoFrente;

    @Column(name = "foto_documento_dorso")
    private byte[] fotoDocumentoDorso;

    // Categoría asignada por la investigación; la mejora por puntaje nunca baja de acá.
    @Enumerated(EnumType.STRING)
    @Column(name = "categoria_base", length = 15)
    private ClienteCategoria categoriaBase;

    @Column(name = "puntaje")
    private Integer puntaje;

    @Column(name = "inhabilitado")
    private Boolean inhabilitado = false;
}
