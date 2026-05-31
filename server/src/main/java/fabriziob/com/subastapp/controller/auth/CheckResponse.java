package fabriziob.com.subastapp.controller.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CheckResponse {
    private boolean available;
}