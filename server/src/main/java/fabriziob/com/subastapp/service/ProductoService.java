package fabriziob.com.subastapp.service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import fabriziob.com.subastapp.controller.producto.ProductoHabilitacionUpdateRequest;
import fabriziob.com.subastapp.controller.producto.ProductoRequest;
import fabriziob.com.subastapp.controller.producto.ProductoResponse;
import fabriziob.com.subastapp.controller.producto.ProductoSeguroResponse;
import fabriziob.com.subastapp.controller.producto.ProductoUpdateRequest;
import fabriziob.com.subastapp.entity.Duenio;
import fabriziob.com.subastapp.entity.Foto;
import fabriziob.com.subastapp.entity.Persona;
import fabriziob.com.subastapp.entity.Producto;
import fabriziob.com.subastapp.entity.ProductoExtra;
import fabriziob.com.subastapp.entity.enums.EstadoBien;
import fabriziob.com.subastapp.entity.Empleado;
import fabriziob.com.subastapp.repository.DuenioRepository;
import fabriziob.com.subastapp.repository.EmpleadoRepository;
import fabriziob.com.subastapp.repository.FotoRepository;
import fabriziob.com.subastapp.repository.ProductoExtraRepository;
import fabriziob.com.subastapp.repository.ProductoRepository;
import fabriziob.com.subastapp.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final ProductoExtraRepository productoExtraRepository;
    private final DuenioRepository duenioRepository;
    private final FotoRepository fotoRepository;
    private final NotificacionService notificacionService;
    private final UserRepository userRepository;
    private final EmpleadoRepository empleadoRepository;

    @Transactional(readOnly = true)
    public Page<ProductoResponse> listar(Pageable pageable) {
        return productoRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtener(Integer id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + id));
        return toResponse(p);
    }

    public ProductoResponse crear(ProductoRequest req, List<MultipartFile> imagenes) throws IOException {
        Integer duenioId = null;
        Persona persona = null;
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof Persona) {
            persona = (Persona) principal;
            duenioId = persona.getIdentificador();
        } else if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            persona = userRepository.findByPersonaExtra_Email(email).orElse(null);
            if (persona != null) {
                duenioId = persona.getIdentificador();
            }
        } else if (principal instanceof String) {
            String email = (String) principal;
            persona = userRepository.findByPersonaExtra_Email(email).orElse(null);
            if (persona != null) {
                duenioId = persona.getIdentificador();
            }
        }
        
        Duenio duenio = null;
        if (duenioId != null) {
            duenio = duenioRepository.findById(duenioId).orElse(null);
        }
        if (duenio == null && persona != null) {
            // Registrar como Duenio en caliente si no existe para evitar productos huérfanos
            Empleado verificador = empleadoRepository.findById(1).orElse(null);
            if (verificador == null) {
                verificador = empleadoRepository.findAll().stream().findFirst().orElse(null);
            }
            if (verificador != null) {
                duenio = Duenio.builder()
                        .persona(persona)
                        .verificacionFinanciera("si")
                        .verificacionJudicial("si")
                        .calificacionRiesgo(1)
                        .verificador(verificador)
                        .build();
                duenio = duenioRepository.save(duenio);
            }
        }
        if (duenio == null) {
            duenio = duenioRepository.findAll().stream().findFirst().orElse(null);
        }
        if (duenio == null) {
            throw new IllegalStateException("No hay dueños registrados en el sistema para asociar al producto.");
        }

        Producto producto = Producto.builder()
                .fecha(req.getFecha() != null ? req.getFecha() : LocalDate.now())
                .disponible(req.getDisponible() != null ? req.getDisponible() : "si")
                .descripcionCatalogo(req.getDescripcionCatalogo() != null ? req.getDescripcionCatalogo() : req.getTitulo())
                .descripcionCompleta(req.getDescripcionCompleta() != null ? req.getDescripcionCompleta() : req.getTitulo())
                .revisor(1)
                .duenio(duenio)
                .fotosIds(new ArrayList<>())
                .build();

        // cantidadPiezas: la constraint chkCantPiezas exige > 1.
        // Solo aplica cuando esPiezaMultiple = true; de lo contrario debe ser null.
        boolean esPiezaMultiple = Boolean.TRUE.equals(req.getEsPiezaMultiple());
        Integer cantidadPiezas = null;
        if (esPiezaMultiple && req.getCantidadPiezas() != null && req.getCantidadPiezas() > 1) {
            cantidadPiezas = req.getCantidadPiezas();
        }

        ProductoExtra extra = ProductoExtra.builder()
                .producto(producto)
                .estadoBien(EstadoBien.recibido)
                .declaracionPropiedad(Boolean.TRUE.equals(req.getDeclaracionPropiedad()))
                .esPiezaMultiple(esPiezaMultiple)
                .cantidadPiezas(cantidadPiezas)
                .esObraDeArte(Boolean.TRUE.equals(req.getEsObraDeArte()))
                .artista(req.getArtista())
                .titulo(req.getTitulo() != null ? req.getTitulo() : producto.getDescripcionCompleta())
                .fechaCreacionObra(req.getFechaCreacionObra())
                .historia(req.getHistoria())
                .deposito(req.getDeposito() != null ? req.getDeposito() : "Lima 700, Monserrat")
                .build();

        producto.setProductoExtra(extra);
        producto = productoRepository.save(producto);

        List<Integer> fotoIds = new java.util.ArrayList<>();
        if (imagenes != null && !imagenes.isEmpty()) {
            fotoIds = saveImagesForProduct(producto, imagenes);
        }

        ProductoResponse response = toResponse(producto);
        response.setFotosIds(fotoIds);
        return response;
    }

    public ProductoResponse patch(Integer id, ProductoUpdateRequest req) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + id));

        if (req.getDisponible() != null) {
            p.setDisponible(req.getDisponible());
        }
        if (req.getDescripcionCatalogo() != null) {
            p.setDescripcionCatalogo(req.getDescripcionCatalogo());
        }
        if (req.getDescripcionCompleta() != null) {
            p.setDescripcionCompleta(req.getDescripcionCompleta());
        }

        ProductoExtra extra = p.getProductoExtra();
        if (extra != null) {
            if (req.getTitulo() != null) extra.setTitulo(req.getTitulo());
            if (req.getArtista() != null) extra.setArtista(req.getArtista());
            if (req.getHistoria() != null) extra.setHistoria(req.getHistoria());
            if (req.getDeposito() != null) extra.setDeposito(req.getDeposito());
            if (req.getEsObraDeArte() != null) extra.setEsObraDeArte(req.getEsObraDeArte());
            if (req.getEsPiezaMultiple() != null) extra.setEsPiezaMultiple(req.getEsPiezaMultiple());
            if (req.getCantidadPiezas() != null) extra.setCantidadPiezas(req.getCantidadPiezas());
            if (req.getFechaCreacionObra() != null) extra.setFechaCreacionObra(req.getFechaCreacionObra());
            productoExtraRepository.save(extra);
        }

        p = productoRepository.save(p);
        return toResponse(p);
    }

    public ProductoResponse patchEstado(Integer id, ProductoHabilitacionUpdateRequest req) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + id));

        ProductoExtra extra = p.getProductoExtra();
        if (extra != null) {
            if (req.getEstadoBien() != null) {
                extra.setEstadoBien(req.getEstadoBien());
            }
            if (req.getMotivoRechazo() != null) {
                extra.setMotivoRechazo(req.getMotivoRechazo());
            }
            productoExtraRepository.save(extra);
        }

        if (req.getEstadoBien() != null && p.getDuenio() != null) {
            Integer duenioId = p.getDuenio().getIdentificador();
            String titulo = extra != null && extra.getTitulo() != null ? extra.getTitulo() : p.getDescripcionCompleta();
            if (req.getEstadoBien() == EstadoBien.inspeccionado) {
                notificacionService.notificarCliente(
                    duenioId,
                    WsNotificacionService.Tipo.info,
                    "envio",
                    "Envío requerido: " + titulo,
                    "Tu artículo ha sido aprobado digitalmente. Por favor, envíalo a nuestro almacén en Lima 700 para la inspección física final."
                );
            } else if (req.getEstadoBien() == EstadoBien.rechazado) {
                String motivo = req.getMotivoRechazo() != null ? req.getMotivoRechazo() : "No cumple con las políticas de calidad.";
                notificacionService.notificarCliente(
                    duenioId,
                    WsNotificacionService.Tipo.warning,
                    "subasta",
                    "Artículo rechazado: " + titulo,
                    "Tu solicitud de subasta fue rechazada. Motivo: " + motivo
                );
            } else if (req.getEstadoBien() == EstadoBien.aceptado) {
                notificacionService.notificarCliente(
                    duenioId,
                    WsNotificacionService.Tipo.info,
                    "subasta",
                    "Propuesta comercial recibida: " + titulo,
                    "Tu artículo superó la inspección física y ya tienes una propuesta comercial con precio base y comisión disponible para tu revisión."
                );
            } else if (req.getEstadoBien() == EstadoBien.devuelto) {
                String motivo = req.getMotivoRechazo() != null ? req.getMotivoRechazo() : "No cumple con los requisitos de tasación física.";
                notificacionService.notificarCliente(
                    duenioId,
                    WsNotificacionService.Tipo.warning,
                    "subasta",
                    "Artículo devuelto: " + titulo,
                    "Tu artículo no superó la inspección física y será devuelto. Motivo: " + motivo
                );
            }
        }

        return toResponse(p);
    }

    public List<Integer> subirFotos(Integer id, List<MultipartFile> imagenes) throws IOException {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + id));

        return saveImagesForProduct(p, imagenes);
    }

    private List<Integer> saveImagesForProduct(Producto p, List<MultipartFile> imagenes) throws IOException {
        List<Integer> ids = new ArrayList<>();
        for (MultipartFile img : imagenes) {
            if (!img.isEmpty()) {
                Foto foto = Foto.builder()
                        .producto(p.getIdentificador())
                        .foto(img.getBytes())
                        .build();
                foto = fotoRepository.save(foto);
                ids.add(foto.getIdentificador());
            }
        }
        return ids;
    }

    @Transactional(readOnly = true)
    public byte[] fotoContent(Integer id, Integer imgId) {
        Foto foto = fotoRepository.findById(imgId)
                .orElseThrow(() -> new EntityNotFoundException("Foto no encontrada: " + imgId));
        if (!foto.getProducto().equals(id)) {
            throw new IllegalArgumentException("La foto no pertenece al producto");
        }
        return foto.getFoto();
    }

    @Transactional(readOnly = true)
    public ProductoSeguroResponse seguro(Integer id) {
        Producto p = productoRepository.findByIdWithSeguro(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + id));

        return ProductoSeguroResponse.builder()
                .seguro(p.getSeguro())
                .seguroObj(Optional.ofNullable(p.getSeguroObj()))
                .build();
    }

    public ProductoResponse toResponse(Producto p) {
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
                .duenioNombre(p.getDuenio() != null && p.getDuenio().getPersona() != null ? p.getDuenio().getPersona().getNombre() : null)
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
}
