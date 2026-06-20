package fabriziob.com.subastapp.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.controller.estatisticas.CategoriaEstadisticaResponse;
import fabriziob.com.subastapp.controller.estatisticas.ClienteParticipacionesResponse;
import fabriziob.com.subastapp.controller.estatisticas.GlobalSubastasResponse;
import fabriziob.com.subastapp.controller.estatisticas.PujoDetalle;
import fabriziob.com.subastapp.entity.Cliente;
import fabriziob.com.subastapp.entity.Subasta;
import fabriziob.com.subastapp.entity.enums.CategoriaSubasta;
import fabriziob.com.subastapp.entity.enums.ClienteCategoria;
import fabriziob.com.subastapp.entity.enums.Moneda;
import fabriziob.com.subastapp.repository.AsistenteRepository;
import fabriziob.com.subastapp.repository.ClienteRepository;
import fabriziob.com.subastapp.repository.ItemCatalogoRepository;
import fabriziob.com.subastapp.repository.PujoRepository;
import fabriziob.com.subastapp.repository.RegistroDeSubastaRepository;
import fabriziob.com.subastapp.repository.SubastaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EstadisticasService {

    private static final Set<String> AGRUPACIONES_VALIDAS = Set.of("mes", "trimestre", "anio");

    private final ClienteRepository clienteRepository;
    private final AsistenteRepository asistenteRepository;
    private final PujoRepository pujoRepository;
    private final SubastaRepository subastaRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final RegistroDeSubastaRepository registroDeSubastaRepository;

    public ClienteParticipacionesResponse getParticipaciones(Integer clienteId) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado: " + clienteId));

        long subastasAsistidas = asistenteRepository.findByCliente_Identificador(clienteId).stream()
                .map(a -> a.getSubasta().getIdentificador())
                .distinct()
                .count();
        Double promedio = pujoRepository.averageImporteByClienteId(clienteId);

        return ClienteParticipacionesResponse.builder()
                .clienteId(clienteId)
                .clienteNombre(cliente.getPersona().getNombre())
                .subastasAsistidas(subastasAsistidas)
                .subastasConPuja(pujoRepository.countUniqueSubastasByClienteId(clienteId))
                .subastasGanadas(pujoRepository.countUniqueSubastasGanadasByClienteId(clienteId))
                .importeTotalOfertado(pujoRepository.sumImporteByClienteId(clienteId))
                .importeTotalPagado(pujoRepository.sumImporteGanadorByClienteId(clienteId))
                .pujoPromedio(promedio != null ? BigDecimal.valueOf(promedio) : BigDecimal.ZERO)
                .build();
    }

    public List<PujoDetalle> getPujosPorSubasta(Integer clienteId, Integer subastaId) {
        clienteRepository.findById(clienteId)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado: " + clienteId));
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new EntityNotFoundException("Subasta no encontrada: " + subastaId));

        // Los pujos no guardan su propia fecha/hora; se usa la fecha+hora de la subasta como aproximación.
        LocalDateTime fechaSubasta = subasta.getFecha() != null
                ? LocalDateTime.of(subasta.getFecha(), subasta.getHora())
                : null;

        return pujoRepository
                .findByAsistente_Cliente_IdentificadorAndAsistente_Subasta_Identificador(clienteId, subastaId)
                .stream()
                .map(p -> PujoDetalle.builder()
                        .subastaId(subastaId)
                        .itemCatalogoId(p.getItem().getIdentificador())
                        .productoDescripcion(p.getItem().getProducto().getDescripcionCatalogo())
                        .monto(p.getImporte())
                        .fecha(fechaSubasta)
                        .ganado("si".equals(p.getGanador()))
                        .build())
                .toList();
    }

    public List<CategoriaEstadisticaResponse> getEstadisticasCategorias() {
        return Arrays.stream(CategoriaSubasta.values())
                .map(this::estadisticaDeCategoria)
                .toList();
    }

    private CategoriaEstadisticaResponse estadisticaDeCategoria(CategoriaSubasta categoria) {
        long totalSubastas = subastaRepository.findByCategoria(categoria).size();
        long totalParticipantes = asistenteRepository.countUniqueAsistentesByCategoria(categoria);
        BigDecimal totalRecaudado = registroDeSubastaRepository.sumImporteByCategoria(categoria);
        if (totalRecaudado == null)
            totalRecaudado = BigDecimal.ZERO;
        BigDecimal promedio = totalSubastas > 0
                ? totalRecaudado.divide(BigDecimal.valueOf(totalSubastas), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return CategoriaEstadisticaResponse.builder()
                .categoria(ClienteCategoria.valueOf(categoria.name()))
                .totalSubastas(totalSubastas)
                .totalParticipantes(totalParticipantes)
                .totalRecaudado(totalRecaudado)
                .promedioRecaudadoPorSubasta(promedio)
                .build();
    }

    public List<GlobalSubastasResponse> getEstadisticasGlobales(LocalDate desde, LocalDate hasta, Moneda moneda,
            CategoriaSubasta categoria, String agrupacion) {
        String agrupacionNormalizada = agrupacion == null ? "mes" : agrupacion.toLowerCase();
        if (!AGRUPACIONES_VALIDAS.contains(agrupacionNormalizada)) {
            throw new IllegalArgumentException(
                    "Agrupación inválida: " + agrupacion + ". Valores válidos: mes, trimestre, anio");
        }

        List<Subasta> subastas = subastaRepository.findForGlobalStats(desde, hasta, categoria, moneda);

        Map<GroupKey, List<Subasta>> grupos = subastas.stream()
                .filter(s -> s.getFecha() != null && s.getSubastaExtra() != null)
                .collect(Collectors.groupingBy(s -> new GroupKey(
                        periodo(s.getFecha(), agrupacionNormalizada),
                        s.getSubastaExtra().getMoneda().name(),
                        s.getCategoria().name())));

        return grupos.entrySet().stream()
                .map(entry -> resumenDeGrupo(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(GlobalSubastasResponse::getPeriodo))
                .toList();
    }

    private GlobalSubastasResponse resumenDeGrupo(GroupKey key, List<Subasta> subastasGrupo) {
        long totalItems = 0;
        BigDecimal totalRecaudado = BigDecimal.ZERO;
        Set<Integer> postoresUnicos = new HashSet<>();
        for (Subasta s : subastasGrupo) {
            totalItems += itemCatalogoRepository.countBySubastaId(s.getIdentificador());
            BigDecimal recaudadoSubasta = registroDeSubastaRepository.sumImporteBySubastaId(s.getIdentificador());
            if (recaudadoSubasta != null)
                totalRecaudado = totalRecaudado.add(recaudadoSubasta);
            postoresUnicos.addAll(pujoRepository.findUniqueBidderIdsBySubastaId(s.getIdentificador()));
        }

        return GlobalSubastasResponse.builder()
                .periodo(key.periodo())
                .moneda(key.moneda())
                .categoria(key.categoria())
                .totalSubastas((long) subastasGrupo.size())
                .totalItems(totalItems)
                .totalRecaudado(totalRecaudado)
                .totalPostores((long) postoresUnicos.size())
                .build();
    }

    private String periodo(LocalDate fecha, String agrupacion) {
        return switch (agrupacion) {
            case "anio" -> String.valueOf(fecha.getYear());
            case "trimestre" -> fecha.getYear() + "-Q" + ((fecha.getMonthValue() - 1) / 3 + 1);
            default -> "%d-%02d".formatted(fecha.getYear(), fecha.getMonthValue());
        };
    }

    private record GroupKey(String periodo, String moneda, String categoria) {
    }
}
