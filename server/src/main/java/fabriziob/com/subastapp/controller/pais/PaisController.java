package fabriziob.com.subastapp.controller.pais;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fabriziob.com.subastapp.entity.Pais;
import fabriziob.com.subastapp.service.PaisService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/paises")
@RequiredArgsConstructor
public class PaisController {

    private final PaisService paisService;

    @GetMapping
    public ResponseEntity<Page<PaisResponse>> getAll(
            @PageableDefault(size = 30, sort = "nombre") Pageable pageable) {
        return ResponseEntity.ok(
                paisService.findAll(pageable).map(this::toResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaisResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(toResponse(paisService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<PaisResponse> create(@RequestBody PaisRequest request) {
        Pais pais = Pais.builder()
                .numero(request.getNumero())
                .nombre(request.getNombre())
                .nombreCorto(request.getNombreCorto())
                .capital(request.getCapital())
                .nacionalidad(request.getNacionalidad())
                .idiomas(request.getIdiomas())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(paisService.create(pais)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        paisService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private PaisResponse toResponse(Pais p) {
        return PaisResponse.builder()
                .numero(p.getNumero())
                .nombre(p.getNombre())
                .nombreCorto(p.getNombreCorto())
                .capital(p.getCapital())
                .nacionalidad(p.getNacionalidad())
                .idiomas(p.getIdiomas())
                .build();
    }
}
