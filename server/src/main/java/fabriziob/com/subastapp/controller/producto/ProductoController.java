package fabriziob.com.subastapp.controller.producto;

import java.io.IOException;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

// TODO: REPOSITORIO MOCKEADO
@RestController
@RequestMapping("/productos")
@RequiredArgsConstructor
@Tag(name = "Productos", description = "Endpoints para productos, incluye imágenes y seguro")
public class ProductoController {

    // private final ProductoService service;

    @Operation(summary = "Listar productos", description = "Devuelve todos los productos con sus datos y lista de IDs de fotos")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de productos")
    })
    @GetMapping
    public ResponseEntity<Page<ProductoResponse>> listar() {
        return null;
    }

    @Operation(summary = "Obtener producto por ID", description = "Devuelve un producto con sus datos completos, extra y lista de IDs de fotos")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Producto encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductoResponse.class))),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> obtener(
            @Parameter(description = "ID del producto", required = true, example = "1") @PathVariable Integer id) {
        return null;
    }

    @Operation(summary = "Crear producto", description = "Crea un producto con sus datos y opcionalmente una lista de imágenes")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Producto creado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductoResponse.class))),
            @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content)
    })
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductoResponse> crear(
            @Parameter(description = "Datos del producto en JSON", required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductoRequest.class))) @RequestPart("datos") ProductoRequest request,
            @Parameter(description = "Lista de imágenes del producto (PNG, JPEG, WEBP)") @RequestPart(value = "imagenes", required = false) List<MultipartFile> imagenes)
            throws IOException {
        return null;
    }

    @Operation(summary = "Actualizar producto", description = "Actualiza parcialmente los campos de un producto. Solo para uso interno de la empresa")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Producto actualizado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductoResponse.class))),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado", content = @Content),
            @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content)
    })
    @PatchMapping("/{id}")
    public ResponseEntity<ProductoResponse> patch(
            @Parameter(description = "ID del producto", required = true, example = "1") @PathVariable Integer id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Campos a actualizar, solo se pisan los que vienen en el body", required = true, content = @Content(schema = @Schema(implementation = ProductoUpdateRequest.class))) @RequestBody ProductoUpdateRequest dto) {
        return null;
    }

    @Operation(summary = "Actualizar habilitación del producto", description = "Cambia el estado del bien. Si el estado es 'rechazado', motivoRechazo es obligatorio. Solo para uso interno de la empresa")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estado actualizado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductoResponse.class))),
            @ApiResponse(responseCode = "400", description = "motivoRechazo requerido al rechazar", content = @Content),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado", content = @Content)
    })
    @PatchMapping("/{id}/habilitacion")
    public ResponseEntity<ProductoResponse> patchEstado(
            @Parameter(description = "ID del producto", required = true, example = "1") @PathVariable Integer id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Nuevo estado del bien", required = true, content = @Content(schema = @Schema(implementation = ProductoHabilitacionUpdateRequest.class))) @RequestBody ProductoHabilitacionUpdateRequest dto) {
        return null;
    }

    @Operation(summary = "Subir fotos", description = "Agrega una o más imágenes a un producto existente. Devuelve la lista de IDs generados")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Fotos subidas, devuelve lista de IDs", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(type = "integer", example = "42")))),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado", content = @Content),
            @ApiResponse(responseCode = "400", description = "No se enviaron imágenes", content = @Content)
    })
    @PostMapping(value = "/{id}/fotos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<Integer>> subirFotos(
            @Parameter(description = "ID del producto", required = true, example = "1") @PathVariable Integer id,
            @Parameter(description = "Lista de imágenes (PNG, JPEG, WEBP)", required = true) @RequestPart("imagenes") List<MultipartFile> imagenes)
            throws IOException {
        return null;
    }

    @Operation(summary = "Obtener imagen", description = "Devuelve el contenido binario de una foto. El Content-Type se detecta automáticamente (PNG, JPEG o WEBP)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Imagen encontrada", content = {
                    @Content(mediaType = MediaType.IMAGE_PNG_VALUE),
                    @Content(mediaType = MediaType.IMAGE_JPEG_VALUE),
                    @Content(mediaType = "image/webp")
            }),
            @ApiResponse(responseCode = "404", description = "Foto o producto no encontrado", content = @Content)
    })
    @GetMapping(value = "/{id}/fotos/{imgId}/content", produces = {
            MediaType.IMAGE_PNG_VALUE,
            MediaType.IMAGE_JPEG_VALUE,
            "image/webp"
    })
    public ResponseEntity<byte[]> fotoContent(
            @Parameter(description = "ID del producto", required = true, example = "1") @PathVariable Integer id,
            @Parameter(description = "ID de la imagen", required = true, example = "12") @PathVariable Integer imgId) {
        return null;
    }

    @Operation(summary = "Obtener seguro del producto", description = "Devuelve el seguro completo si la póliza existe en la tabla de seguros, solo el número si está registrado pero no existe en la tabla, o indica que no tiene seguro")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Seguro encontrado o sin seguro", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductoSeguroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado", content = @Content)
    })
    @GetMapping("/{id}/seguro")
    public ResponseEntity<ProductoSeguroResponse> seguro(
            @Parameter(description = "ID del producto", required = true, example = "1") @PathVariable Integer id) {
        return null;
    }
}