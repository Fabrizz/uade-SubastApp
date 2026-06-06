package fabriziob.com.subastapp.controller.cliente;

import java.math.BigDecimal;
import java.time.LocalDate;

import fabriziob.com.subastapp.entity.enums.Moneda;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MedioPagoChequeRequest {

    @NotNull(message = "moneda es obligatoria")
    private Moneda moneda;

    @NotBlank(message = "nroCheque es obligatorio")
    @Size(max = 50)
    private String nroCheque;

    @NotBlank(message = "banco es obligatorio")
    @Size(max = 150)
    private String banco;

    @NotNull(message = "montoCertificado es obligatorio")
    @DecimalMin(value = "0.01", message = "montoCertificado debe ser mayor a 0")
    private BigDecimal montoCertificado;

    @NotNull(message = "fechaVencimiento es obligatoria")
    @Future(message = "fechaVencimiento debe ser futura")
    private LocalDate fechaVencimiento;
}
