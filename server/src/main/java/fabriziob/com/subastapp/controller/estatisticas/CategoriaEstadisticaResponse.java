package fabriziob.com.subastapp.controller.estatisticas;

import java.util.List;

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
    // Lo recaudado se desglosa por moneda porque las subastas de una misma categoría
    // pueden ser en ARS o en USD; sumarlas mezcladas daría un total sin sentido.
    private List<CategoriaMonedaResponse> porMoneda;
}