package fabriziob.com.subastapp.controller.subasta;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MarcarGanadorRequest {

    @NotNull(message = "medioPagoCompradorId es obligatorio")
    private Integer medioPagoCompradorId;
}
