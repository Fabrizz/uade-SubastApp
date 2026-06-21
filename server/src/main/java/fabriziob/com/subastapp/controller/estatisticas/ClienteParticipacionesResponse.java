package fabriziob.com.subastapp.controller.estatisticas;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    // Los importes se desglosan por moneda porque cada subasta es ARS o USD; sumarlos
    // mezclados daría un total sin sentido.
    private List<ImporteMonedaResponse> porMoneda;
}
