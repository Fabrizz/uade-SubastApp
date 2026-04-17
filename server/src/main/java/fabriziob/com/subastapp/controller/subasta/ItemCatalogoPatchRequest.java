package fabriziob.com.subastapp.controller.subasta;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ItemCatalogoPatchRequest {
    private BigDecimal precioBase;
    private BigDecimal comision;
    private String subastado;
}
