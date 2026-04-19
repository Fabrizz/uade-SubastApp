package fabriziob.com.subastapp.controller.notificacion;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificacionResponse {
    private Integer identificador;
    private Integer destinatarioId;
    private String destinatarioNombre;
    private String titulo;
    private String descripcion;
    private LocalDateTime fecha;
    private String accion;
    private String imagen;
    private String tipo;
    private Boolean leida;
}
