package fabriziob.com.subastapp.controller.estatisticas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteParticipacionesResponse {
    private Integer clienteId;
    private String clienteNombre;
    private Long subastasAsistidas;
    private Long subastasConPuja;
    private Long subastasGanadas;
    private BigDecimal importeTotalOfertado;
    private BigDecimal importeTotalPagado;
    private BigDecimal pujoPromedio;
}
