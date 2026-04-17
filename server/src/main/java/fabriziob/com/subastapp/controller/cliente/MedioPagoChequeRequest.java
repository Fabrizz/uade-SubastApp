package fabriziob.com.subastapp.controller.cliente;

import java.math.BigDecimal;
import java.time.LocalDate;

import fabriziob.com.subastapp.entity.enums.Moneda;
import lombok.Data;

@Data
public class MedioPagoChequeRequest {
    private Moneda moneda;
    private String nroCheque;
    private String banco;
    private BigDecimal montoCertificado;
    private LocalDate fechaVencimiento;
}
