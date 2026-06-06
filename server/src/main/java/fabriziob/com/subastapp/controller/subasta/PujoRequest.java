package fabriziob.com.subastapp.controller.subasta;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PujoRequest {

    @NotNull(message = "asistenteId es obligatorio")
    private Integer asistenteId;

    @NotNull(message = "importe es obligatorio")
    @DecimalMin(value = "0.01", message = "importe debe ser mayor a 0")
    private BigDecimal importe;
}
