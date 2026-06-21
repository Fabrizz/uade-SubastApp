package fabriziob.com.subastapp.controller.estatisticas;

import java.math.BigDecimal;

import fabriziob.com.subastapp.entity.enums.Moneda;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaMonedaResponse {
    private Moneda moneda;
    private Long totalSubastas;
    private BigDecimal totalRecaudado;
    private BigDecimal promedioRecaudadoPorSubasta;
}
