package fabriziob.com.subastapp.controller.producto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class ProductoRequest {
    // campos de productos
    private LocalDate fecha;
    private String disponible;
    private String descripcionCatalogo;
    private String descripcionCompleta;
    // private Integer revisor;
    // private Integer duenio;
    // private String seguro;

    // campos de productos_extra
    // private EstadoBien estadoBien;
    // private String motivoRechazo;
    private Boolean declaracionPropiedad;
    private Boolean esPiezaMultiple;
    private Integer cantidadPiezas;
    private Boolean esObraDeArte;
    private String artista;
    private LocalDate fechaCreacionObra;
    private String historia;
    private String deposito;
}
