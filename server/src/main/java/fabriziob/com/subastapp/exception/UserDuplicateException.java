package fabriziob.com.subastapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "Usuario (persona) ya existe o email es duplicado")
public class UserDuplicateException extends Exception {

}