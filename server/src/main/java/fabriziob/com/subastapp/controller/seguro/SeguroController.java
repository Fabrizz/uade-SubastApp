package fabriziob.com.subastapp.controller.seguro;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fabriziob.com.subastapp.service.SeguroService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/seguros")
@RequiredArgsConstructor
public class SeguroController {

    private final SeguroService seguroService;

    @GetMapping
    public List<SeguroResponse> getAll() {
        return seguroService.getAll();
    }

    @GetMapping("/{nroPoliza}")
    public ResponseEntity<SeguroResponse> getById(@PathVariable String nroPoliza) {
        return seguroService.getById(nroPoliza)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SeguroResponse> create(@RequestBody SeguroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(seguroService.create(request));
    }

    @PutMapping("/{nroPoliza}")
    public ResponseEntity<SeguroResponse> update(@PathVariable String nroPoliza, @RequestBody SeguroRequest request) {
        return seguroService.update(nroPoliza, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{nroPoliza}")
    public ResponseEntity<Void> delete(@PathVariable String nroPoliza) {
        return seguroService.delete(nroPoliza)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
