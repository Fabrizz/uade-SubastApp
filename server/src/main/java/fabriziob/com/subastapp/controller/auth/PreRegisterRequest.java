package fabriziob.com.subastapp.controller.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreRegisterRequest {
    private String nombre;
    private String documento;
    private String direccion;
    private String email;
    private String telefono;
    private Integer numeroPais;
}
