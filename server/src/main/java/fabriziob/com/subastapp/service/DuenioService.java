package fabriziob.com.subastapp.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.controller.duenio.DuenioRequest;
import fabriziob.com.subastapp.controller.duenio.DuenioResponse;
import fabriziob.com.subastapp.controller.duenio.DuenioUpdateRequest;
import fabriziob.com.subastapp.controller.producto.ProductoResponse;
import fabriziob.com.subastapp.entity.Duenio;
import fabriziob.com.subastapp.entity.Empleado;
import fabriziob.com.subastapp.entity.Pais;
import fabriziob.com.subastapp.entity.Persona;
import fabriziob.com.subastapp.entity.Producto;
import fabriziob.com.subastapp.entity.ProductoExtra;
import fabriziob.com.subastapp.repository.DuenioRepository;
import fabriziob.com.subastapp.repository.EmpleadoRepository;
import fabriziob.com.subastapp.repository.PaisRepository;
import fabriziob.com.subastapp.repository.ProductoRepository;
import fabriziob.com.subastapp.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class DuenioService {

    private final DuenioRepository duenioRepository;
    private final UserRepository userRepository;
    private final PaisRepository paisRepository;
    private final EmpleadoRepository empleadoRepository;
    private final ProductoRepository productoRepository;


    @Transactional(readOnly = true)
    public Page<DuenioResponse> getAll(Pageable pageable) {
        return duenioRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public DuenioResponse getById(Integer id) {
        Duenio duenio = duenioRepository.findByIdWithAll(id)
                .orElseThrow(() -> new EntityNotFoundException("Dueño no encontrado: " + id));
        return toResponse(duenio);
    }

    public DuenioResponse create(DuenioRequest req) {
        Persona persona = userRepository.findById(req.getIdentificadorPersona())
                .orElseThrow(() -> new EntityNotFoundException("Persona no encontrada: " + req.getIdentificadorPersona()));

        Pais pais = null;
        if (req.getPaisNumero() != null) {
            pais = paisRepository.findById(req.getPaisNumero())
                    .orElseThrow(() -> new EntityNotFoundException("País no encontrado: " + req.getPaisNumero()));
        }

        Empleado verificador = null;
        Integer verificadorId = req.getVerificadorId() != null ? req.getVerificadorId() : 1;
        verificador = empleadoRepository.findById(verificadorId)
                .orElseThrow(() -> new EntityNotFoundException("Verificador no encontrado: " + verificadorId));

        Duenio duenio = Duenio.builder()
                .persona(persona)
                .pais(pais)
                .verificacionFinanciera(req.getVerificacionFinanciera() != null ? req.getVerificacionFinanciera() : "si")
                .verificacionJudicial(req.getVerificacionJudicial() != null ? req.getVerificacionJudicial() : "si")
                .calificacionRiesgo(req.getCalificacionRiesgo() != null ? req.getCalificacionRiesgo() : 1)
                .verificador(verificador)
                .build();

        duenio = duenioRepository.save(duenio);
        return toResponse(duenio);
    }

    public DuenioResponse patch(Integer id, DuenioUpdateRequest req) {
        Duenio duenio = duenioRepository.findByIdWithAll(id)
                .orElseThrow(() -> new EntityNotFoundException("Dueño no encontrado: " + id));

        if (req.getPaisNumero() != null) {
            Pais pais = paisRepository.findById(req.getPaisNumero())
                    .orElseThrow(() -> new EntityNotFoundException("País no encontrado: " + req.getPaisNumero()));
            duenio.setPais(pais);
        }

        if (req.getVerificacionFinanciera() != null) {
            duenio.setVerificacionFinanciera(req.getVerificacionFinanciera());
        }

        if (req.getVerificacionJudicial() != null) {
            duenio.setVerificacionJudicial(req.getVerificacionJudicial());
        }

        if (req.getCalificacionRiesgo() != null) {
            duenio.setCalificacionRiesgo(req.getCalificacionRiesgo());
        }

        if (req.getVerificadorId() != null) {
            Empleado verificador = empleadoRepository.findById(req.getVerificadorId())
                    .orElseThrow(() -> new EntityNotFoundException("Verificador no encontrado: " + req.getVerificadorId()));
            duenio.setVerificador(verificador);
        }

        duenio = duenioRepository.save(duenio);
        return toResponse(duenio);
    }

    public void delete(Integer id) {
        if (!duenioRepository.existsById(id)) {
            throw new EntityNotFoundException("Dueño no encontrado: " + id);
        }
        duenioRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Page<ProductoResponse> getProductos(Integer id, Pageable pageable) {
        if (!duenioRepository.existsById(id)) {
            throw new EntityNotFoundException("Dueño no encontrado: " + id);
        }
        return productoRepository.findByDuenioIdentificador(id, pageable).map(this::toProductoResponse);
    }

    private ProductoResponse toProductoResponse(Producto p) {
        if (p == null) return null;
        ProductoExtra extra = p.getProductoExtra();
        return ProductoResponse.builder()
                .identificador(p.getIdentificador())
                .fecha(p.getFecha())
                .disponible(p.getDisponible())
                .titulo(extra != null ? extra.getTitulo() : p.getDescripcionCompleta())
                .descripcionCatalogo(p.getDescripcionCatalogo())
                .descripcionCompleta(p.getDescripcionCompleta())
                .revisor(p.getRevisor())
                .duenio(p.getDuenio() != null ? p.getDuenio().getIdentificador() : null)
                .seguro(p.getSeguro())
                .fotosIds(p.getFotosIds())
                .estadoBien(extra != null ? extra.getEstadoBien() : null)
                .motivoRechazo(extra != null ? extra.getMotivoRechazo() : null)
                .declaracionPropiedad(extra != null ? extra.getDeclaracionPropiedad() : null)
                .esPiezaMultiple(extra != null ? extra.getEsPiezaMultiple() : null)
                .cantidadPiezas(extra != null ? extra.getCantidadPiezas() : null)
                .esObraDeArte(extra != null ? extra.getEsObraDeArte() : null)
                .artista(extra != null ? extra.getArtista() : null)
                .fechaCreacionObra(extra != null ? extra.getFechaCreacionObra() : null)
                .historia(extra != null ? extra.getHistoria() : null)
                .deposito(extra != null ? extra.getDeposito() : null)
                .build();
    }


    public DuenioResponse toResponse(Duenio d) {
        if (d == null) return null;
        Persona p = d.getPersona();
        Pais pais = d.getPais();
        if (pais == null && p != null && p.getCliente() != null) {
            pais = p.getCliente().getPais();
        }
        Empleado v = d.getVerificador();
        
        return DuenioResponse.builder()
                .identificador(d.getIdentificador())
                .nombre(p != null ? p.getNombre() : null)
                .documento(p != null ? p.getDocumento() : null)
                .email(p != null && p.getPersonaExtra() != null ? p.getPersonaExtra().getEmail() : null)
                .pais(pais != null ? pais.getNombre() : null)
                .verificacionFinanciera(d.getVerificacionFinanciera())
                .verificacionJudicial(d.getVerificacionJudicial())
                .calificacionRiesgo(d.getCalificacionRiesgo())
                .verificadorId(v != null ? v.getIdentificador() : null)
                .verificadorNombre(v != null && v.getPersona() != null ? v.getPersona().getNombre() : null)
                .build();
    }
}
