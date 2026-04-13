package fabriziob.com.subastapp.controller.pais;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaisResponse {
    private Integer numero;
    private String nombre;
    private String nombreCorto;
    private String capital;
    private String nacionalidad;
    private String idiomas;
}