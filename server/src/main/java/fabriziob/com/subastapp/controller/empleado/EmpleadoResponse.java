package fabriziob.com.subastapp.controller.empleado;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmpleadoResponse {
    private Integer identificador;
    private String nombre;
    private String documento;
    private String email;
    private String telefono;
    private String cargo;
    private String estado;
    private Integer sectorId;
    private String sectorNombre;
}
