package fabriziob.com.subastapp.controller.sector;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fabriziob.com.subastapp.entity.Sector;
import fabriziob.com.subastapp.service.SectorService;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.RequiredArgsConstructor;

@Hidden
@RestController
@RequestMapping("/api/v1/sectores")
@RequiredArgsConstructor
public class SectorController {

    private final SectorService sectorService;

    @GetMapping
    public ResponseEntity<Page<SectorResponse>> getAll(
            @PageableDefault(size = 30, sort = "nombreSector") Pageable pageable) {
        return ResponseEntity.ok(
                sectorService.findAll(pageable).map(this::toResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SectorResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(toResponse(sectorService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<SectorResponse> create(@RequestBody SectorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(sectorService.create(request)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<SectorResponse> update(
            @PathVariable Integer id,
            @RequestBody SectorRequest request) {
        return ResponseEntity.ok(toResponse(sectorService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        sectorService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private SectorResponse toResponse(Sector s) {
        return SectorResponse.builder()
                .identificador(s.getIdentificador())
                .nombreSector(s.getNombreSector())
                .codigoSector(s.getCodigoSector())
                .responsableSectorId(s.getResponsableSector())
                .responsableSectorNombre(s.getResponsable() != null
                        ? s.getResponsable().getPersona().getNombre()
                        : null)
                .build();
    }
}