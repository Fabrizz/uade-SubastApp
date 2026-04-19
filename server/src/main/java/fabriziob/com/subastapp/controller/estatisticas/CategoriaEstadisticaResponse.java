package fabriziob.com.subastapp.controller.estatisticas;

import java.math.BigDecimal;

import fabriziob.com.subastapp.entity.enums.ClienteCategoria;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaEstadisticaResponse {
    private ClienteCategoria categoria;
    private Long totalSubastas;
    private Long totalParticipantes;
    private BigDecimal totalRecaudado;
    private BigDecimal promedioRecaudadoPorSubasta;
}