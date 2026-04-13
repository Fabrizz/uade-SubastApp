package fabriziob.com.subastapp.entity;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "personas")
public class Persona implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "documento", nullable = false, length = 20)
    private String documento;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "direccion", length = 250)
    private String direccion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 15)
    private EstadoPersona estado;

    public enum EstadoPersona {
        ACTIVO, INACTIVO
    }

    @Column(name = "foto")
    private byte[] foto;

    @OneToOne(mappedBy = "persona", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private PersonaExtra personaExtra;

    @OneToOne(mappedBy = "persona", fetch = FetchType.LAZY)
    private Cliente cliente;

    // -------------------------------------------------------
    // UserDetails
    // -------------------------------------------------------

    @Override
    public String getUsername() {
        return personaExtra != null ? personaExtra.getEmail() : null;
    }

    @Override
    public String getPassword() {
        return personaExtra != null ? personaExtra.getPasswordHash() : null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (cliente == null)
            return List.of();
        return List.of(new SimpleGrantedAuthority("ROLE_" + cliente.getCategoria().toUpperCase()));
    }

    @Override
    public boolean isEnabled() {
        boolean personaActiva = EstadoPersona.ACTIVO.equals(estado);
        boolean clienteHabilitado = cliente == null
                || cliente.getClienteExtra() == null
                || !"inhabilitado".equals(cliente.getClienteExtra().getEstadoOperativo());
        return personaActiva && clienteHabilitado;
    }

    @Override
    public boolean isAccountNonLocked() {
        if (cliente == null || cliente.getClienteExtra() == null)
            return true;
        return !"inhabilitado".equals(cliente.getClienteExtra().getEstadoOperativo());
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
}