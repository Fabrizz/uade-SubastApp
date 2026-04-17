package fabriziob.com.subastapp.controller.subasta;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class RegistroDeSubastaRequest {
    private Integer duenioId;
    private Integer productoId;
    private Integer clienteId;
    private BigDecimal importe;
    private BigDecimal comision;
}
