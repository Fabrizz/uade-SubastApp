package fabriziob.com.subastapp.controller.estatisticas;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PujoDetalle {
    private Integer subastaId;
    private Integer itemCatalogoId;
    private String productoDescripcion;
    private BigDecimal monto;
    private LocalDateTime fecha;
    private Boolean ganado;
}