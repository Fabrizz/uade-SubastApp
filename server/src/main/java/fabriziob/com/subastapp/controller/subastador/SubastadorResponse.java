package fabriziob.com.subastapp.controller.subastador;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubastadorResponse {
    private Integer identificador;
    private String matricula;
    private String region;
}
