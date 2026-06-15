package com.questio.questio_backend.entity;

import com.questio.questio_backend.entity.enums.TipoUsuario;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID idUsuario;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "senha", nullable = false,length = 255)
    private String senha;

    @Column(nullable = false, length = 255)
    private String curso;

    @Column(name = "tipo", nullable = false)
    private String tipoUsuario;

    @Column(name = "termo_aceito", nullable = false)
    @Builder.Default
    private Boolean termoAceito = false;

    @Builder.Default
    @Column(name = "xp_total", nullable = false)
    private Integer xpTotal = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer nivel = 1;

    @Builder.Default
    @Column(name = "sequencia_dias", nullable = false)
    private Integer streakAtual = 0;

    @Builder.Default
    @Column(name = "maior_streak", nullable = false)
    private Integer maiorStreak = 0;

    @Builder.Default
    @Column(name = "criado_em", updatable = false, nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "acesso_bloqueado", nullable = false)
    private Boolean acessoBloqueado = false;

    @Builder.Default
    @Column(name = "ultima_atividade_em", nullable = false)
    private LocalDateTime ultimaAtividadeEm = LocalDateTime.now();

    @Column(name = "ultimo_checkin_em")
    private LocalDateTime ultimoCheckinEm;

    @Column(name = "email_verificado", nullable = false)
    @Builder.Default
    private Boolean emailVerificado = false;

    @Builder.Default
    @ManyToMany
    @JoinTable(
            name = "usuario_turmas",
            joinColumns = @JoinColumn(name = "id_usuario"),
            inverseJoinColumns = @JoinColumn(name = "id_turma")
    )
    private Set<Class> turmas = new HashSet<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities(){
        if (this.tipoUsuario == null || this.tipoUsuario.isBlank()) {
            return List.of();
        }
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.tipoUsuario.toUpperCase()));
    }

    @Override
    public String getPassword() { return this.senha; }

    @Override
    public String getUsername() { return this.email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
