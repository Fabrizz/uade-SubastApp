package fabriziob.com.subastapp.controller.subasta;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsistenteResponse {
    private Integer identificador;
    private Integer numeroPostor;
    private Integer clienteId;
    private String clienteNombre;
    private String estado;
    private LocalDateTime fechaHoraIngreso;
    private LocalDateTime fechaHoraSalida;
}
