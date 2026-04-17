package fabriziob.com.subastapp.controller.subasta;

import java.time.LocalDate;
import java.time.LocalTime;

import fabriziob.com.subastapp.entity.enums.CategoriaSubasta;
import fabriziob.com.subastapp.entity.enums.Moneda;
import lombok.Data;

@Data
public class SubastaRequest {
    private LocalDate fecha;
    private LocalTime hora;
    private Integer subastadorId;
    private String ubicacion;
    private Integer capacidadAsistentes;
    private String tieneDeposito;
    private String seguridadPropia;
    private CategoriaSubasta categoria;
    // extra
    private Moneda moneda;
    private Boolean esColeccion;
    private String nombreColeccion;
}
