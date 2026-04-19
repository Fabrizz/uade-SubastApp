package fabriziob.com.subastapp.controller.subasta;

import fabriziob.com.subastapp.entity.enums.EstadoAceptacionItem;
import lombok.Data;

@Data
public class ItemCatalogoPatchAceptacionRequest {

    private EstadoAceptacionItem estadoAceptacion;
}
