package fabriziob.com.subastapp.controller.pais;

import lombok.Data;

@Data
public class PaisRequest {
    private Integer numero;
    private String nombre;
    private String nombreCorto;
    private String capital;
    private String nacionalidad;
    private String idiomas;
}