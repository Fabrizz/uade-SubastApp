package fabriziob.com.subastapp.controller.subasta;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistroDeSubastaResponse {
    private Integer identificador;
    private Integer subastaId;
    private Integer duenioId;
    private String duenioNombre;
    private Integer productoId;
    private String productoDescripcion;
    private Integer clienteId;
    private String clienteNombre;
    private BigDecimal importe;
    private BigDecimal comision;
}
