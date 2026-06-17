package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.LoginRequestDTO;
import com.questio.questio_backend.dto.UserRegisterRequestDTO;
import com.questio.questio_backend.entity.User;
import com.questio.questio_backend.entity.enums.TipoUsuario;
import com.questio.questio_backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void registerNewUser_quandoNaoAluno_rejeitaCadastroPublico() {
        var response = authService.registerNewUser(UserRegisterRequestDTO.builder()
                .nome("Coord Teste")
                .email("coord.teste@questio.com")
                .senha("senha-segura-123")
                .curso("")
                .tipoUsuario(TipoUsuario.COORDENACAO)
                .termoAceito(true)
                .build());

        assertThat(response.idUsuario()).isNull();
        assertThat(response.mensagem()).contains("Cadastro de professor e coordenação");
    }

    @Test
    void login_quandoAcessoBloqueado_disparaErro() {
        User user = userRepository.save(User.builder()
                .nome("Aluno Bloqueado")
                .email("aluno.bloqueado@questio.com")
                .senha(passwordEncoder.encode("senha-segura-123"))
                .curso("")
                .tipoUsuario(TipoUsuario.ALUNO.getValor())
                .termoAceito(true)
                .emailVerificado(true)
                .acessoBloqueado(true)
                .xpTotal(0)
                .nivel(1)
                .streakAtual(0)
                .build());

        assertThatThrownBy(() -> authService.login(new LoginRequestDTO(user.getEmail(), "senha-segura-123")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("acesso está bloqueado");
    }
}
