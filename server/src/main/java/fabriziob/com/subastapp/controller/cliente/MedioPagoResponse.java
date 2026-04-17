package fabriziob.com.subastapp.controller.cliente;

import com.fasterxml.jackson.annotation.JsonInclude;

import fabriziob.com.subastapp.entity.enums.Moneda;
import fabriziob.com.subastapp.entity.enums.TipoMedioPago;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MedioPagoResponse {
    private Integer identificador;
    private TipoMedioPago tipo;
    private Moneda moneda;
    private Boolean verificado;
    private Boolean activo;
    // solo uno de estos tres va a tener valor según el tipo
    private MedioPagoChequeDetail cheque;
    private MedioPagoCuentaDetail cuenta;
    private MedioPagoTarjetaDetail tarjeta;
}
