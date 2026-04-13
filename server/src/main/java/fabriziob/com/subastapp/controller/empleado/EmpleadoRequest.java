package fabriziob.com.subastapp.controller.empleado;

import lombok.Data;

@Data
public class EmpleadoRequest {
    private String nombre;
    private String documento;
    private String direccion;
    private String email;
    private String telefono;
    private String password;
    private String cargo;
    private Integer sector;
}
