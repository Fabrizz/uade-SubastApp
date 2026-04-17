package fabriziob.com.subastapp.controller.cliente;

import fabriziob.com.subastapp.entity.enums.Moneda;
import lombok.Data;

@Data
public class MedioPagoCuentaRequest {
    private Moneda moneda;
    private String titular;
    private String banco;
    private String cbu;
    private String alias;
    private Boolean esExterior;
    private String iban;
    private Integer pais;
}
