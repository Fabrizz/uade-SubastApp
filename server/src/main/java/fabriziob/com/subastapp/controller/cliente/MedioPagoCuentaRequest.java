package fabriziob.com.subastapp.controller.cliente;

import fabriziob.com.subastapp.entity.enums.CajaAhorroTipoCuenta;
import fabriziob.com.subastapp.entity.enums.Moneda;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MedioPagoCuentaRequest {

    @NotNull(message = "moneda es obligatoria")
    private Moneda moneda;

    @NotBlank(message = "titular es obligatorio")
    @Size(max = 150)
    private String titular;

    @NotBlank(message = "banco es obligatorio")
    @Size(max = 150)
    private String banco;

    @Size(max = 50)
    private String cbu;

    @Size(max = 50)
    private String alias;

    private Boolean esExterior;

    @Size(max = 50)
    private String iban;

    private Integer pais;

    @NotNull(message = "tipoDeCuenta es obligatorio")
    private CajaAhorroTipoCuenta tipoDeCuenta;
}
