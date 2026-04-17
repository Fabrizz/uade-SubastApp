package fabriziob.com.subastapp.controller.producto;

import java.util.Optional;

import fabriziob.com.subastapp.entity.Seguro;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductoSeguroResponse {
    private Optional<Seguro> seguroObj;
    private String seguro;
}
