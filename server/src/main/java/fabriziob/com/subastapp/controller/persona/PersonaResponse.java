package fabriziob.com.subastapp.controller.persona;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PersonaResponse {
    private Integer identificador;
    private String nombre;
    private String documento;
    private String direccion;
    private String estado;
    private String email;
    private String telefono;
}
