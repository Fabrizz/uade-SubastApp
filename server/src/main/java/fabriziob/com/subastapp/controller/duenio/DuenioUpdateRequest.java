package fabriziob.com.subastapp.controller.duenio;

import lombok.Data;

@Data
public class DuenioUpdateRequest {
    private Integer paisNumero;
    private String verificacionFinanciera;
    private String verificacionJudicial;
    private Integer calificacionRiesgo;
    private Integer verificadorId;
}
