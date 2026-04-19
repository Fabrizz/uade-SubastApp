package fabriziob.com.subastapp.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.controller.empleado.SectorRequest;
import fabriziob.com.subastapp.entity.Sector;
import fabriziob.com.subastapp.repository.EmpleadoRepository;
import fabriziob.com.subastapp.repository.SectorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class SectorService {

    private final SectorRepository sectorRepository;
    private final EmpleadoRepository empleadoRepository;

    @Transactional(readOnly = true)
    public Page<Sector> findAll(Pageable pageable) {
        return sectorRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Sector findById(Integer id) {
        return sectorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sector no encontrado: " + id));
    }

    public Sector create(SectorRequest request) {
        if (request.getResponsableSector() != null &&
                !empleadoRepository.existsById(request.getResponsableSector()))
            throw new EntityNotFoundException("Empleado no encontrado: " + request.getResponsableSector());

        Sector sector = Sector.builder()
                .nombreSector(request.getNombreSector())
                .codigoSector(request.getCodigoSector())
                .responsableSector(request.getResponsableSector())
                .build();

        return sectorRepository.save(sector);
    }

    public Sector update(Integer id, SectorRequest request) {
        Sector sector = findById(id);

        if (request.getNombreSector() != null)
            sector.setNombreSector(request.getNombreSector());
        if (request.getCodigoSector() != null)
            sector.setCodigoSector(request.getCodigoSector());
        if (request.getResponsableSector() != null) {
            if (!empleadoRepository.existsById(request.getResponsableSector()))
                throw new EntityNotFoundException("Empleado no encontrado: " + request.getResponsableSector());
            sector.setResponsableSector(request.getResponsableSector());
        }

        return sectorRepository.save(sector);
    }

    public void delete(Integer id) {
        if (!sectorRepository.existsById(id))
            throw new EntityNotFoundException("Sector no encontrado: " + id);
        sectorRepository.deleteById(id);
    }
}
