package fabriziob.com.subastapp.controller.subasta;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class PujoRequest {
    private Integer asistenteId;
    private BigDecimal importe;
}
