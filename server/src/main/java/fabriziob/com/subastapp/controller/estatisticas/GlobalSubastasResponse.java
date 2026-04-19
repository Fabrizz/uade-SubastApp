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
public class GlobalSubastasResponse {
    private String periodo; // ej: "2025-04", "2025-Q1"
    private String moneda;
    private String categoria;
    private Long totalSubastas;
    private Long totalItems;
    private BigDecimal totalRecaudado;
    private Long totalPostores;
}
