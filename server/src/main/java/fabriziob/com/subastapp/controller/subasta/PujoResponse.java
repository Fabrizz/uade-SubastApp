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
public class PujoResponse {
    private Integer identificador;
    private Integer asistenteId;
    private Integer clienteId;
    private String clienteNombre;
    private Integer numeroPostor;
    private Integer itemId;
    private String productoDescripcion;
    private BigDecimal importe;
    private String ganador;
}
