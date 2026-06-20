package fabriziob.com.subastapp.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabriziob.com.subastapp.controller.subasta.CatalogoRequest;
import fabriziob.com.subastapp.controller.subasta.CatalogoResponse;
import fabriziob.com.subastapp.controller.subasta.ItemCatalogoPatchAceptacionRequest;
import fabriziob.com.subastapp.controller.subasta.ItemCatalogoPatchRequest;
import fabriziob.com.subastapp.controller.subasta.ItemCatalogoRequest;
import fabriziob.com.subastapp.controller.subasta.ItemCatalogoResponse;
import fabriziob.com.subastapp.entity.Catalogo;
import fabriziob.com.subastapp.entity.Empleado;
import fabriziob.com.subastapp.entity.ItemCatalogo;
import fabriziob.com.subastapp.entity.Producto;
import fabriziob.com.subastapp.entity.Subasta;
import fabriziob.com.subastapp.entity.enums.EstadoAceptacionItem;
import fabriziob.com.subastapp.repository.CatalogoRepository;
import fabriziob.com.subastapp.repository.EmpleadoRepository;
import fabriziob.com.subastapp.repository.ItemCatalogoRepository;
import fabriziob.com.subastapp.repository.ProductoRepository;
import fabriziob.com.subastapp.repository.SubastaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CatalogoService {

        private final CatalogoRepository catalogoRepository;
        private final ItemCatalogoRepository itemRepository;
        private final SubastaRepository subastaRepository;
        private final EmpleadoRepository empleadoRepository;
        private final ProductoRepository productoRepository;

        // ─── lecturas ──────────────────────────────────────────────────────────

        @Transactional(readOnly = true)
        public Page<ItemCatalogoResponse> getItems(Integer subastaId, Pageable pageable) {
                verificarSubasta(subastaId);
                List<ItemCatalogoResponse> all = catalogoRepository.findBySubasta_Identificador(subastaId).stream()
                                .flatMap(c -> itemRepository.findByCatalogoIdWithProducto(c.getIdentificador()).stream())
                                .map(this::toItemResponse)
                                .toList();

                int start = (int) pageable.getOffset();
                int end = Math.min(start + pageable.getPageSize(), all.size());
                List<ItemCatalogoResponse> content = start <= end && start < all.size()
                                ? all.subList(start, end)
                                : List.of();
                return new PageImpl<>(content, pageable, all.size());
        }

        @Transactional(readOnly = true)
        public ItemCatalogoResponse getItem(Integer subastaId, Integer idItem) {
                ItemCatalogo item = itemRepository.findById(idItem)
                                .orElseThrow(() -> new EntityNotFoundException("Item no encontrado: " + idItem));
                verificarItemEnSubasta(item, subastaId);
                return toItemResponse(item);
        }

        @Transactional(readOnly = true)
        public ItemCatalogoResponse getCatalogoItemByProducto(Integer productoId) {
                List<ItemCatalogo> items = itemRepository.findByProducto_Identificador(productoId);
                if (items.isEmpty()) {
                        throw new EntityNotFoundException("El producto " + productoId + " no está asociado a ningún catálogo");
                }
                return toItemResponse(items.get(0));
        }

        @Transactional(readOnly = true)
        public CatalogoResponse getCatalogo(Integer subastaId) {
                Catalogo catalogo = catalogoRepository.findBySubastaIdWithItems(subastaId).stream()
                                .findFirst()
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "La subasta " + subastaId + " no tiene catálogo"));
                return toCatalogoResponse(catalogo);
        }

        // ─── carga (seeding) ─────────────────────────────────────────────────────

        public CatalogoResponse createCatalogo(Integer subastaId, CatalogoRequest req) {
                Subasta subasta = subastaRepository.findById(subastaId)
                                .orElseThrow(() -> new EntityNotFoundException("Subasta no encontrada: " + subastaId));
                Empleado responsable = empleadoRepository.findById(req.getResponsableId())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Empleado no encontrado: " + req.getResponsableId()));

                Catalogo catalogo = Catalogo.builder()
                                .descripcion(req.getDescripcion())
                                .subasta(subasta)
                                .responsable(responsable)
                                .build();
                catalogo = catalogoRepository.save(catalogo);
                return toCatalogoResponse(catalogo);
        }

        public ItemCatalogoResponse addItem(Integer subastaId, ItemCatalogoRequest req) {
                Catalogo catalogo = catalogoRepository.findBySubasta_Identificador(subastaId).stream()
                                .findFirst()
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "La subasta " + subastaId + " no tiene catálogo; cree uno primero"));
                Producto producto = productoRepository.findById(req.getProductoId())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Producto no encontrado: " + req.getProductoId()));

                ItemCatalogo item = ItemCatalogo.builder()
                                .catalogo(catalogo)
                                .producto(producto)
                                .precioBase(req.getPrecioBase())
                                .comision(req.getComision())
                                .subastado("no")
                                .build();
                item = itemRepository.save(item);
                return toItemResponse(item);
        }

        public ItemCatalogoResponse setAceptacion(Integer subastaId, Integer idItem, ItemCatalogoPatchAceptacionRequest req) {
                ItemCatalogo item = itemRepository.findById(idItem)
                                .orElseThrow(() -> new EntityNotFoundException("Item no encontrado: " + idItem));
                verificarItemEnSubasta(item, subastaId);
                
                if (req.getEstadoAceptacion() != null) {
                        item.setEstadoAceptacion(req.getEstadoAceptacion());
                        
                        // Update the product's EstadoBien as appropriate
                        if (item.getProducto() != null) {
                                Producto p = item.getProducto();
                                if (req.getEstadoAceptacion() == EstadoAceptacionItem.aceptado) {
                                        if (p.getProductoExtra() != null) {
                                                p.getProductoExtra().setEstadoBien(fabriziob.com.subastapp.entity.enums.EstadoBien.aceptado);
                                        }
                                } else if (req.getEstadoAceptacion() == EstadoAceptacionItem.rechazado) {
                                        if (p.getProductoExtra() != null) {
                                                p.getProductoExtra().setEstadoBien(fabriziob.com.subastapp.entity.enums.EstadoBien.devuelto);
                                        }
                                }
                                productoRepository.save(p);
                        }
                }
                
                item = itemRepository.save(item);
                return toItemResponse(item);
        }

        public ItemCatalogoResponse patchItem(Integer subastaId, Integer idItem, ItemCatalogoPatchRequest req) {
                ItemCatalogo item = itemRepository.findById(idItem)
                                .orElseThrow(() -> new EntityNotFoundException("Item no encontrado: " + idItem));
                verificarItemEnSubasta(item, subastaId);

                if (req.getPrecioBase() != null) {
                        item.setPrecioBase(req.getPrecioBase());
                }
                if (req.getComision() != null) {
                        item.setComision(req.getComision());
                }
                if (req.getSubastado() != null) {
                        item.setSubastado(req.getSubastado());
                }
                if (req.getEstadoAceptacion() != null) {
                        item.setEstadoAceptacion(req.getEstadoAceptacion());
                }

                item = itemRepository.save(item);
                return toItemResponse(item);
        }

        public void deleteItem(Integer subastaId, Integer idItem) {
                ItemCatalogo item = itemRepository.findById(idItem)
                                .orElseThrow(() -> new EntityNotFoundException("Item no encontrado: " + idItem));
                verificarItemEnSubasta(item, subastaId);
                itemRepository.delete(item);
        }

        // ─── helpers ───────────────────────────────────────────────────────────

        private void verificarSubasta(Integer subastaId) {
                if (!subastaRepository.existsById(subastaId))
                        throw new EntityNotFoundException("Subasta no encontrada: " + subastaId);
        }

        private void verificarItemEnSubasta(ItemCatalogo item, Integer subastaId) {
                Catalogo catalogo = item.getCatalogo();
                if (catalogo == null || catalogo.getSubasta() == null
                                || !catalogo.getSubasta().getIdentificador().equals(subastaId))
                        throw new IllegalArgumentException(
                                        "El item " + item.getIdentificador() + " no pertenece a la subasta " + subastaId);
        }

        private CatalogoResponse toCatalogoResponse(Catalogo c) {
                List<ItemCatalogoResponse> items = c.getItems() == null ? List.of()
                                : c.getItems().stream().map(this::toItemResponse).toList();
                Empleado responsable = c.getResponsable();
                return CatalogoResponse.builder()
                                .identificador(c.getIdentificador())
                                .descripcion(c.getDescripcion())
                                .subastaId(c.getSubasta() != null ? c.getSubasta().getIdentificador() : null)
                                .responsableId(responsable != null ? responsable.getIdentificador() : null)
                                .responsableNombre(responsable != null && responsable.getPersona() != null
                                                ? responsable.getPersona().getNombre()
                                                : null)
                                .items(items)
                                .build();
        }

        private ItemCatalogoResponse toItemResponse(ItemCatalogo i) {
                Producto producto = i.getProducto();
                Catalogo catalogo = i.getCatalogo();
                Integer subastaId = (catalogo != null && catalogo.getSubasta() != null)
                                ? catalogo.getSubasta().getIdentificador() : null;

                return ItemCatalogoResponse.builder()
                                .identificador(i.getIdentificador())
                                .catalogoId(catalogo != null ? catalogo.getIdentificador() : null)
                                .subastaId(subastaId)
                                .productoId(producto != null ? producto.getIdentificador() : null)
                                .productoDescripcion(producto != null ? producto.getDescripcionCatalogo() : null)
                                .precioBase(i.getPrecioBase())
                                .comision(i.getComision())
                                .subastado(i.getSubastado())
                                .estadoAceptacion(i.getEstadoAceptacion())
                                .build();
        }
}
