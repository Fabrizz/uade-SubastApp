package fabriziob.com.subastapp.controller.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreRegisterResponse {
    private String email;
    private String temporaryPassword;
}
