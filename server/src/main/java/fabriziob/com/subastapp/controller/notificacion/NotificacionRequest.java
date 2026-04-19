package fabriziob.com.subastapp.controller.notificacion;

import lombok.Data;

@Data
public class NotificacionRequest {
    private Integer destinatarioId;
    private String titulo;
    private String descripcion;
    private String accion;
    private String imagen;
    private String tipo;
}