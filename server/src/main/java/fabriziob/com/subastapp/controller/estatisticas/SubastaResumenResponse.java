package fabriziob.com.subastapp.controller.estatisticas;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubastaResumenResponse {
    private Integer subastaId;
    private BigDecimal totalRecaudado;
    private Long itemsVendidos;
    private Long itemsNoVendidos;
    private Long totalItems;
    private Long postoresActivos;
}
