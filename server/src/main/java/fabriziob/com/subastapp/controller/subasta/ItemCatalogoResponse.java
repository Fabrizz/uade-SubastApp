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
public class ItemCatalogoResponse {
    private Integer identificador;
    private Integer catalogoId;
    private Integer productoId;
    private String productoDescripcion;
    private BigDecimal precioBase;
    private BigDecimal comision;
    private String subastado;
}
