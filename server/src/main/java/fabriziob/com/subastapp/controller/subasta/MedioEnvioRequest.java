package fabriziob.com.subastapp.controller.subasta;

import java.math.BigDecimal;

import fabriziob.com.subastapp.entity.enums.MedioEnvio;
import lombok.Data;

@Data
public class MedioEnvioRequest {
    private MedioEnvio medioEnvio; // requerido
    private String direccionEnvio; // requerido si medioEnvio = ENVIO_DOMICILIO
    private Integer paisEnvioId; // requerido si medioEnvio = ENVIO_DOMICILIO
    private BigDecimal costoEnvio; // opcional
}