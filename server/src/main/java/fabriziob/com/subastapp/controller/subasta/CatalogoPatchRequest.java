package fabriziob.com.subastapp.controller.subasta;

import lombok.Data;

@Data
public class CatalogoPatchRequest {
    private String descripcion;
    private Integer responsableId;
}
