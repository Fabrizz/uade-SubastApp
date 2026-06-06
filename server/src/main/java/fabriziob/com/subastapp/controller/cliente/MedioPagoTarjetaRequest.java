package fabriziob.com.subastapp.controller.cliente;

import fabriziob.com.subastapp.entity.enums.Moneda;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MedioPagoTarjetaRequest {

    @NotNull(message = "moneda es obligatoria")
    private Moneda moneda;

    @NotBlank(message = "titular es obligatorio")
    @Size(max = 150)
    private String titular;

    @NotBlank(message = "ultimos4 es obligatorio")
    @Pattern(regexp = "\\d{4}", message = "ultimos4 debe tener exactamente 4 dígitos")
    private String ultimos4;

    @NotBlank(message = "marca es obligatoria")
    @Size(max = 20)
    private String marca;

    @NotBlank(message = "vencimiento es obligatorio")
    @Pattern(regexp = "(0[1-9]|1[0-2])/\\d{4}", message = "vencimiento debe tener formato MM/YYYY")
    private String vencimiento;

    private Boolean esInternacional;
}
