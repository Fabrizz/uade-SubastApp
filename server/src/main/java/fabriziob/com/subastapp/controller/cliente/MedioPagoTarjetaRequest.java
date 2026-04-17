package fabriziob.com.subastapp.controller.cliente;

import fabriziob.com.subastapp.entity.enums.Moneda;
import lombok.Data;

@Data
public class MedioPagoTarjetaRequest {
    private Moneda moneda;
    private String titular;
    private String ultimos4;
    private String marca;
    private String vencimiento; // MM/YYYY
    private Boolean esInternacional;
}
