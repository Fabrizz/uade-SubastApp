package fabriziob.com.subastapp.controller.duenio;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DuenioResponse {
    private Integer identificador;
    private String nombre;
    private String documento;
    private String email;
    private String pais;
    private String verificacionFinanciera;
    private String verificacionJudicial;
    private Integer calificacionRiesgo;
    private Integer verificadorId;
    private String verificadorNombre;
}
