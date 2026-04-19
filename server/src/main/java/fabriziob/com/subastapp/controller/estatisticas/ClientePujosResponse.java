package fabriziob.com.subastapp.controller.estatisticas;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientePujosResponse {
    private Integer clienteId;
    private String clienteNombre;
    private List<PujoDetalle> historial;
    private BigDecimal importeTotalOfertado;
    private BigDecimal importeTotalPagado;
    private BigDecimal pujoPromedio;
}
