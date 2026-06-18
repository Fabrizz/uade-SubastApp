package fabriziob.com.subastapp.controller.subasta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Evento liviano emitido a /topic/subastas/{id} para señalar cambios de estado
 * de la subasta (p. ej. avance de ítem). El front lo usa como disparador para
 * refetchear el catálogo y re-derivar el ítem actual.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubastaEventoResponse {
    private String tipo;
    private Integer subastaId;
    private Integer itemId;
}
