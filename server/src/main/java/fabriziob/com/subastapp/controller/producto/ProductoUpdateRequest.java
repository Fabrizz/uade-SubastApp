package fabriziob.com.subastapp.controller.producto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class ProductoUpdateRequest {
    private LocalDate fecha;
    private String disponible;
    private String titulo;
    private String descripcionCatalogo;
    private String descripcionCompleta;
    private Integer revisor;
    private Boolean declaracionPropiedad;
    private Boolean esPiezaMultiple;
    private Integer cantidadPiezas;
    private Boolean esObraDeArte;
    private String artista;
    private LocalDate fechaCreacionObra;
    private String historia;
    private String deposito;
}
