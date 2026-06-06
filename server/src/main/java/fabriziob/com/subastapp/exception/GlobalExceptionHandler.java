package fabriziob.com.subastapp.exception;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe ->
                errores.put(fe.getField(), fe.getDefaultMessage()));
        return ResponseEntity.badRequest().body(body(HttpStatus.BAD_REQUEST, "Datos inválidos", errores));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> errores = new HashMap<>();
        for (ConstraintViolation<?> v : ex.getConstraintViolations()) {
            errores.put(v.getPropertyPath().toString(), v.getMessage());
        }
        return ResponseEntity.badRequest().body(body(HttpStatus.BAD_REQUEST, "Datos inválidos", errores));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(body(HttpStatus.NOT_FOUND, ex.getMessage(), null));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(body(HttpStatus.BAD_REQUEST, ex.getMessage(), null));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(body(HttpStatus.CONFLICT, ex.getMessage(), null));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, Object>> handleForbidden(SecurityException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(body(HttpStatus.FORBIDDEN, ex.getMessage(), null));
    }

    private Map<String, Object> body(HttpStatus status, String mensaje, Map<String, String> detalles) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("mensaje", mensaje);
        if (detalles != null && !detalles.isEmpty())
            body.put("detalles", detalles);
        return body;
    }
}
