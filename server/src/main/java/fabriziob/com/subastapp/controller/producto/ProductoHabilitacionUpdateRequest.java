package fabriziob.com.subastapp.controller.producto;

import fabriziob.com.subastapp.entity.enums.EstadoBien;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductoHabilitacionUpdateRequest {
    @NotNull
    private EstadoBien estadoBien;
    private String motivoRechazo;

    private Integer revisor;
    private String seguro;
}
