package fabriziob.com.subastapp.controller.subasta;

import java.time.LocalDate;
import java.time.LocalTime;

import fabriziob.com.subastapp.entity.enums.CategoriaSubasta;
import fabriziob.com.subastapp.entity.enums.EstadoDetalladoSubasta;
import fabriziob.com.subastapp.entity.enums.EstadoSubasta;
import fabriziob.com.subastapp.entity.enums.Moneda;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubastaResponse {
    // subasta
    private Integer identificador;
    private LocalDate fecha;
    private LocalTime hora;
    private EstadoSubasta estado;
    private Integer subastadorId;
    private String subastadorNombre;
    private String ubicacion;
    private Integer capacidadAsistentes;
    private String tieneDeposito;
    private String seguridadPropia;
    private CategoriaSubasta categoria;
    // extra
    private Moneda moneda;
    private EstadoDetalladoSubasta estadoDetallado;
    private Boolean esColeccion;
    private String nombreColeccion;
}
