package fabriziob.com.subastapp.controller.producto;

import java.time.LocalDate;
import java.util.List;

import fabriziob.com.subastapp.entity.enums.EstadoBien;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductoResponse {
    private Integer identificador;
    private LocalDate fecha;
    private String disponible;
    private String descripcionCatalogo;
    private String descripcionCompleta;
    private Integer revisor;
    private Integer duenio;
    private String seguro;
    private List<Integer> fotosIds;
    // datos de productos_extra
    private EstadoBien estadoBien;
    private String motivoRechazo;
    private Boolean declaracionPropiedad;
    private Boolean esPiezaMultiple;
    private Integer cantidadPiezas;
    private Boolean esObraDeArte;
    private String artista;
    private LocalDate fechaCreacionObra;
    private String historia;
    private String deposito;
}
