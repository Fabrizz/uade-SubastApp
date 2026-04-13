package fabriziob.com.subastapp.controller.cliente;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClienteResponse {
    private Integer identificador;
    private String nombre;
    private String email;
    private String admitido;
    private String categoria;
    private String estadoOperativo;
    private BigDecimal multaPendiente;
    private String pais;
}