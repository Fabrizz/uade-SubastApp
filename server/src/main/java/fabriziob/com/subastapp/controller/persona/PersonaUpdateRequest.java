package fabriziob.com.subastapp.controller.persona;

import lombok.Data;

@Data
public class PersonaUpdateRequest {
    private String nombre;
    private String direccion;
    private byte[] foto;
}
