package fabriziob.com.subastapp.controller.cliente;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedioPagoChequeDetail {
    private String nroCheque;
    private String banco;
    private BigDecimal montoCertificado;
    private LocalDate fechaVencimiento;
}
