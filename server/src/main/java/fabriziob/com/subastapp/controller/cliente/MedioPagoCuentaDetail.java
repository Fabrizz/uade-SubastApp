package fabriziob.com.subastapp.controller.cliente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedioPagoCuentaDetail {
    private String titular;
    private String banco;
    private String cbu;
    private String alias;
    private Boolean esExterior;
    private String iban;
    private Integer pais;
}
