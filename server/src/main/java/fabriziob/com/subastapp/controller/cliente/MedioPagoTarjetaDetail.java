package fabriziob.com.subastapp.controller.cliente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedioPagoTarjetaDetail {
    private String titular;
    private String ultimos4;
    private String marca;
    private String vencimiento;
    private Boolean esInternacional;
}
