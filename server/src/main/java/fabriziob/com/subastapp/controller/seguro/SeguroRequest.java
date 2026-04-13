package fabriziob.com.subastapp.controller.seguro;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SeguroRequest {
    private String nroPoliza;
    private String compania;
    private String polizaCombinada;
    private BigDecimal importe;
}
