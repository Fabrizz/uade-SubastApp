package fabriziob.com.subastapp.controller.subasta;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CatalogoResponse {
    private Integer identificador;
    private String descripcion;
    private Integer subastaId;
    private Integer responsableId;
    private String responsableNombre;
    private List<ItemCatalogoResponse> items;
}
