package fabriziob.com.subastapp.controller.subastador;

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

import fabriziob.com.subastapp.entity.Subastador;
import fabriziob.com.subastapp.repository.SubastadorService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/subastadores")
@RequiredArgsConstructor
public class SubastadorController {

    private final SubastadorService subastadorService;

    @GetMapping
    public List<SubastadorResponse> getAll() {
        return subastadorService.getAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubastadorResponse> getById(@PathVariable Integer id) {
        return subastadorService.getById(id)
                .map(s -> ResponseEntity.ok(toResponse(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SubastadorResponse> create(@RequestBody SubastadorRequest request) {
        Subastador saved = subastadorService.create(
                request.getIdentificador(),
                request.getMatricula(),
                request.getRegion());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubastadorResponse> update(@PathVariable Integer id, @RequestBody SubastadorRequest request) {
        return subastadorService.update(id, request.getMatricula(), request.getRegion())
                .map(s -> ResponseEntity.ok(toResponse(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        return subastadorService.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    private SubastadorResponse toResponse(Subastador s) {
        return SubastadorResponse.builder()
                .identificador(s.getIdentificador())
                .matricula(s.getMatricula())
                .region(s.getRegion())
                .build();
    }
}
