package fabriziob.com.subastapp.controller.subasta;

import java.math.BigDecimal;

import fabriziob.com.subastapp.entity.enums.MedioEnvio;
import lombok.Data;

@Data
public class RegistroDeSubastaRequest {
    // registro base
    private Integer duenioId;
    private Integer productoId;
    private Integer clienteId;
    private BigDecimal importe;
    private BigDecimal comision;
    // extra
    private Integer cuentaCobroDuenioId;
    private String direccionEnvio;
    private Integer paisEnvioId;
    private MedioEnvio medioEnvio;
    private BigDecimal costoEnvio;
    private BigDecimal importeNeto;
}
