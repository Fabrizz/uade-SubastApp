package fabriziob.com.subastapp.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import fabriziob.com.subastapp.controller.seguro.SeguroRequest;
import fabriziob.com.subastapp.controller.seguro.SeguroResponse;
import fabriziob.com.subastapp.entity.Seguro;
import fabriziob.com.subastapp.repository.SeguroRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SeguroService {

    private final SeguroRepository seguroRepository;

    public List<SeguroResponse> getAll() {
        return seguroRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public Optional<SeguroResponse> getById(String nroPoliza) {
        return seguroRepository.findById(nroPoliza).map(this::toResponse);
    }

    public SeguroResponse create(SeguroRequest request) {
        return toResponse(seguroRepository.save(toEntity(request)));
    }

    public Optional<SeguroResponse> update(String nroPoliza, SeguroRequest request) {
        if (!seguroRepository.existsById(nroPoliza))
            return Optional.empty();
        Seguro seguro = toEntity(request);
        seguro.setNroPoliza(nroPoliza);
        return Optional.of(toResponse(seguroRepository.save(seguro)));
    }

    public boolean delete(String nroPoliza) {
        if (!seguroRepository.existsById(nroPoliza))
            return false;
        seguroRepository.deleteById(nroPoliza);
        return true;
    }

    private SeguroResponse toResponse(Seguro s) {
        return SeguroResponse.builder()
                .nroPoliza(s.getNroPoliza())
                .compania(s.getCompania())
                .polizaCombinada(s.getPolizaCombinada())
                .importe(s.getImporte())
                .build();
    }

    private Seguro toEntity(SeguroRequest r) {
        Seguro pais = Seguro.builder()
                .nroPoliza(r.getNroPoliza())
                .compania(r.getCompania())
                .polizaCombinada(r.getPolizaCombinada())
                .importe(r.getImporte())
                .build();
        return pais;
    }
}