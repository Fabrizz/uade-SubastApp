package fabriziob.com.subastapp.controller.subasta;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import fabriziob.com.subastapp.entity.enums.EstadoPagoDuenio;
import fabriziob.com.subastapp.entity.enums.MedioEnvio;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistroDeSubastaResponse {
    // registro base
    private Integer identificador;
    private Integer subastaId;
    private Integer duenioId;
    private String duenioNombre;
    private Integer productoId;
    private String productoDescripcion;
    private Integer clienteId;
    private String clienteNombre;
    private BigDecimal importe;
    private BigDecimal comision;
    // extra
    private Integer extraId;
    private Integer cuentaCobroDuenioId;
    private String direccionEnvio;
    private Integer paisEnvioId;
    private String paisEnvioNombre;
    private EstadoPagoDuenio estadoPagoDuenio;
    private LocalDateTime fechaTransferencia;
    private BigDecimal importeNeto;
    private BigDecimal costoEnvio;
    private MedioEnvio medioEnvio;
}
