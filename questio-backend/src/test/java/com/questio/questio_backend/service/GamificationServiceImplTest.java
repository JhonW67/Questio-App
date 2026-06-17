package com.questio.questio_backend.service;

import com.questio.questio_backend.entity.User;
import com.questio.questio_backend.entity.enums.TipoUsuario;
import com.questio.questio_backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class GamificationServiceImplTest {

    @Autowired
    private GamificationService gamificationService;

    @Autowired
    private UserRepository userRepository;

    private User novoUsuarioBase() {
        return User.builder()
                .nome("Teste")
                .email("teste_" + System.nanoTime() + "@exemplo.com")
                .senha("senha")
                .curso("SI")
                .tipoUsuario(TipoUsuario.ALUNO.getValor())
                .termoAceito(true)
                .xpTotal(0)
                .nivel(1)
                .streakAtual(0)
                .build();
    }

    @Test
    void checkin_quandoPrimeiroCheckin_defineStreakComo1() {
        var user = novoUsuarioBase();
        user.setUltimoCheckinEm(null);
        user.setStreakAtual(0);
        user = userRepository.save(user);

        var response = gamificationService.checkin(user.getIdUsuario());

        assertThat(response.streakAtual()).isEqualTo(1);
        var salvo = userRepository.findById(user.getIdUsuario()).orElseThrow();
        assertThat(salvo.getUltimoCheckinEm()).isNotNull();
        assertThat(salvo.getStreakAtual()).isEqualTo(1);
    }

    @Test
    void checkin_quandoUltimoCheckinFoiOntem_incrementaStreak() {
        var user = novoUsuarioBase();
        user.setStreakAtual(3);
        user.setUltimoCheckinEm(LocalDateTime.now().minusDays(1));
        user = userRepository.save(user);

        var response = gamificationService.checkin(user.getIdUsuario());

        assertThat(response.streakAtual()).isEqualTo(4);
    }

    @Test
    void checkin_quandoUltimoCheckinFoiHoje_mantemStreak() {
        var user = novoUsuarioBase();
        user.setStreakAtual(5);
        user.setUltimoCheckinEm(LocalDateTime.now());
        user = userRepository.save(user);

        var response = gamificationService.checkin(user.getIdUsuario());

        assertThat(response.streakAtual()).isEqualTo(5);
    }

    @Test
    void checkin_quandoFicouDiaSemEntrar_reiniciaStreakPara1() {
        var user = novoUsuarioBase();
        user.setStreakAtual(7);
        // Ex.: último check-in foi há 2 dias => ficou pelo menos 1 dia inteiro sem entrar
        user.setUltimoCheckinEm(LocalDateTime.now().minusDays(2));
        user = userRepository.save(user);

        var response = gamificationService.checkin(user.getIdUsuario());

        assertThat(response.streakAtual()).isEqualTo(1);
        var salvo = userRepository.findById(user.getIdUsuario()).orElseThrow();
        assertThat(salvo.getStreakAtual()).isEqualTo(1);
        // Ao voltar no dia atual após perder a sequência, o usuário inicia uma nova ofensiva.
        assertThat(salvo.getUltimoCheckinEm()).isNotNull();
    }
}
