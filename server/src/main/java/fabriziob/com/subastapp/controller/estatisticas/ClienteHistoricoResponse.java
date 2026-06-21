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
public class ClienteHistoricoResponse {
    private String periodo; // ej: "2025-04"
    // Cada entrada es de una sola moneda: si el cliente pujó en ARS y USD en el mismo
    // mes, ese mes aparece dos veces (una por moneda) para no sumar importes mezclados.
    private Moneda moneda;
    private Long cantidadPujas;
    private BigDecimal importeOfertado;
    private BigDecimal importeGanado;
    private Long subastasGanadas;
}
