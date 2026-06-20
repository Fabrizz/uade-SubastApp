package fabriziob.com.subastapp.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.controller.estatisticas.CategoriaEstadisticaResponse;
import fabriziob.com.subastapp.controller.estatisticas.ClienteParticipacionesResponse;
import fabriziob.com.subastapp.controller.estatisticas.GlobalSubastasResponse;
import fabriziob.com.subastapp.controller.estatisticas.PujoDetalle;
import fabriziob.com.subastapp.entity.Cliente;
import fabriziob.com.subastapp.entity.Pujo;
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

    private final ClienteRepository clienteRepository;
    private final AsistenteRepository asistenteRepository;
    private final PujoRepository pujoRepository;
    private final RegistroDeSubastaRepository registroRepository;
    private final SubastaRepository subastaRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;

    // ─── participaciones de un cliente ──────────────────────────────────────

    public ClienteParticipacionesResponse getParticipaciones(Integer clienteId) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado: " + clienteId));

        long subastasAsistidas = asistenteRepository.findByCliente_Identificador(clienteId).size();
        long subastasConPuja = pujoRepository.countUniqueSubastasByClienteId(clienteId);
        long subastasGanadas = pujoRepository.countUniqueSubastasGanadasByClienteId(clienteId);

        BigDecimal importeTotalOfertado = pujoRepository.sumImporteByClienteId(clienteId);
        BigDecimal importeTotalPagado = pujoRepository.sumImporteGanadorByClienteId(clienteId);
        Double avgDouble = pujoRepository.averageImporteByClienteId(clienteId);
        BigDecimal pujoPromedio = avgDouble != null
                ? BigDecimal.valueOf(avgDouble).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        String nombre = cliente.getPersona() != null ? cliente.getPersona().getNombre() : null;

        return ClienteParticipacionesResponse.builder()
                .clienteId(clienteId)
                .clienteNombre(nombre)
                .subastasAsistidas(subastasAsistidas)
                .subastasConPuja(subastasConPuja)
                .subastasGanadas(subastasGanadas)
                .importeTotalOfertado(importeTotalOfertado != null ? importeTotalOfertado : BigDecimal.ZERO)
                .importeTotalPagado(importeTotalPagado != null ? importeTotalPagado : BigDecimal.ZERO)
                .pujoPromedio(pujoPromedio)
                .build();
    }

    // ─── pujos de un cliente en una subasta ─────────────────────────────────

    public List<PujoDetalle> getPujosPorSubasta(Integer clienteId, Integer subastaId) {
        if (!clienteRepository.existsById(clienteId))
            throw new EntityNotFoundException("Cliente no encontrado: " + clienteId);

        List<Pujo> pujos = pujoRepository
                .findByAsistente_Cliente_IdentificadorAndAsistente_Subasta_Identificador(clienteId, subastaId);

        return pujos.stream().map(p -> PujoDetalle.builder()
                .subastaId(p.getAsistente() != null && p.getAsistente().getSubasta() != null
                        ? p.getAsistente().getSubasta().getIdentificador()
                        : null)
                .itemCatalogoId(p.getItem() != null ? p.getItem().getIdentificador() : null)
                .productoDescripcion(p.getItem() != null && p.getItem().getProducto() != null
                        ? p.getItem().getProducto().getDescripcionCatalogo()
                        : null)
                .monto(p.getImporte())
                .fecha(null) // Pujo entity does not have a fechaHora field
                .ganado("si".equals(p.getGanador()))
                .build())
                .collect(Collectors.toList());
    }

    // ─── estadísticas globales por categoría de cliente ─────────────────────

    public List<CategoriaEstadisticaResponse> getEstadisticasCategorias() {
        List<CategoriaEstadisticaResponse> result = new ArrayList<>();

        // Categorías de subasta (comun, especial, plata, oro, platino) mapeadas
        // a categorías de cliente del mismo nombre.
        for (CategoriaSubasta cat : Arrays.asList(CategoriaSubasta.values())) {
            long totalSubastas = subastaRepository.findByCategoria(cat).size();
            long totalParticipantes = asistenteRepository.countUniqueAsistentesByCategoria(cat);

            BigDecimal totalRecaudado = registroRepository.sumImporteByCategoria(cat);
            if (totalRecaudado == null) totalRecaudado = BigDecimal.ZERO;

            BigDecimal promedio = totalSubastas > 0
                    ? totalRecaudado.divide(BigDecimal.valueOf(totalSubastas), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            // Mapear CategoriaSubasta → ClienteCategoria por nombre (mismos valores)
            ClienteCategoria clienteCat = ClienteCategoria.valueOf(cat.name());

            result.add(CategoriaEstadisticaResponse.builder()
                    .categoria(clienteCat)
                    .totalSubastas(totalSubastas)
                    .totalParticipantes(totalParticipantes)
                    .totalRecaudado(totalRecaudado)
                    .promedioRecaudadoPorSubasta(promedio)
                    .build());
        }

        return result;
    }

    // ─── estadísticas globales de subastas ──────────────────────────────────

    public List<GlobalSubastasResponse> getEstadisticasGlobales(
            LocalDate desde, LocalDate hasta,
            Moneda moneda, CategoriaSubasta categoria,
            String agrupacion) {

        List<Subasta> subastas = subastaRepository.findForGlobalStats(desde, hasta, categoria, moneda);

        // Agrupar por período
        Map<String, List<Subasta>> grouped = new LinkedHashMap<>();
        for (Subasta s : subastas) {
            String key = buildPeriodoKey(s.getFecha(), agrupacion);
            grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }

        List<GlobalSubastasResponse> result = new ArrayList<>();
        for (Map.Entry<String, List<Subasta>> entry : grouped.entrySet()) {
            List<Subasta> grupo = entry.getValue();

            // Count items via ItemCatalogoRepository using subasta IDs
            long totalItems = grupo.stream()
                    .mapToLong(s -> itemCatalogoRepository.countBySubastaId(s.getIdentificador()))
                    .sum();

            BigDecimal totalRecaudado = grupo.stream()
                    .flatMap(s -> registroRepository.findBySubasta_Identificador(s.getIdentificador()).stream())
                    .map(r -> r.getImporte() != null ? r.getImporte() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long totalPostores = grupo.stream()
                    .mapToLong(s -> pujoRepository.countUniqueBiddersBySubastaId(s.getIdentificador()))
                    .sum();

            String monedaStr = grupo.stream()
                    .map(s -> s.getSubastaExtra() != null && s.getSubastaExtra().getMoneda() != null
                            ? s.getSubastaExtra().getMoneda().name()
                            : Moneda.ARS.name())
                    .distinct()
                    .collect(Collectors.joining("/"));

            String catStr = grupo.stream()
                    .map(s -> s.getCategoria() != null ? s.getCategoria().name() : "")
                    .distinct()
                    .collect(Collectors.joining("/"));

            result.add(GlobalSubastasResponse.builder()
                    .periodo(entry.getKey())
                    .moneda(monedaStr)
                    .categoria(catStr)
                    .totalSubastas((long) grupo.size())
                    .totalItems(totalItems)
                    .totalRecaudado(totalRecaudado)
                    .totalPostores(totalPostores)
                    .build());
        }

        return result;
    }

    // ─── helpers ────────────────────────────────────────────────────────────

    private String buildPeriodoKey(LocalDate fecha, String agrupacion) {
        if (fecha == null) return "sin-fecha";
        return switch (agrupacion.toLowerCase()) {
            case "trimestre" -> {
                int trimestre = (fecha.getMonthValue() - 1) / 3 + 1;
                yield fecha.getYear() + "-Q" + trimestre;
            }
            case "anio" -> String.valueOf(fecha.getYear());
            default -> fecha.getYear() + "-" + String.format("%02d", fecha.getMonthValue()); // mes
        };
    }
}
