package fabriziob.com.subastapp.controller.subasta;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ItemCatalogoRequest {
    private Integer productoId;
    private BigDecimal precioBase;
    private BigDecimal comision;
}
