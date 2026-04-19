package fabriziob.com.subastapp.controller.empleado;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SectorResponse {
    private Integer identificador;
    private String nombreSector;
    private String codigoSector;
    private Integer responsableSectorId;
    private String responsableSectorNombre;
}
