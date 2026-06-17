package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.UserResponseDTO;
import com.questio.questio_backend.entity.User;
import com.questio.questio_backend.entity.enums.TipoUsuario;
import com.questio.questio_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GamificationServiceImpl implements GamificationService {

    private final UserRepository userRepository;

    @Override
    public UserResponseDTO checkin(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        LocalDate hoje = LocalDate.now(java.time.ZoneId.of("America/Sao_Paulo"));
        LocalDateTime ultimoCheckinEm = user.getUltimoCheckinEm();
        LocalDate ultimoDia = ultimoCheckinEm == null ? null : ultimoCheckinEm.toLocalDate();

        Integer streak = user.getStreakAtual() == null ? 0 : user.getStreakAtual();

        if (ultimoDia == null) {
            user.setStreakAtual(1);
        } else if (ultimoDia.isEqual(hoje)) {
            user.setStreakAtual(streak);
        } else if (ultimoDia.isEqual(hoje.minusDays(1))) {
            user.setStreakAtual(streak + 1);
        } else {
            user.setStreakAtual(1);
        }

        Integer maiorStreakAtual = user.getMaiorStreak() == null ? 0 : user.getMaiorStreak();
        if (user.getStreakAtual() > maiorStreakAtual) {
            user.setMaiorStreak(user.getStreakAtual());
        }

        LocalDateTime agora = LocalDateTime.now(java.time.ZoneId.of("America/Sao_Paulo"));
        user.setUltimoCheckinEm(agora);
        user.setUltimaAtividadeEm(agora);

        User salvo = userRepository.save(user);
        TipoUsuario tipo = TipoUsuario.fromString(salvo.getTipoUsuario());

        return UserResponseDTO.builder()
                .idUsuario(salvo.getIdUsuario())
                .nome(salvo.getNome())
                .email(salvo.getEmail())
                .curso(salvo.getCurso())
                .tipoUsuario(tipo)
                .termoAceito(salvo.getTermoAceito())
                .xpTotal(salvo.getXpTotal())
                .nivel(salvo.getNivel())
                .streakAtual(salvo.getStreakAtual())
                .maiorStreak(salvo.getMaiorStreak())
                .ultimoCheckinEm(salvo.getUltimoCheckinEm())
                .acessoBloqueado(Boolean.TRUE.equals(salvo.getAcessoBloqueado()))
                .mensagem("Sequência de dias atualizada com sucesso.")
                .build();
    }

    @Override
    public void addXp(UUID userId, int xp) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        int xpAtual = user.getXpTotal() == null ? 0 : user.getXpTotal();
        int novoXp = xpAtual + Math.max(0, xp);
        user.setXpTotal(novoXp);

        int nivelAtual = user.getNivel() == null ? 1 : user.getNivel();
        int novoNivel = (int) (Math.sqrt(novoXp) / 10) + 1;
        if (novoNivel > nivelAtual) {
            user.setNivel(novoNivel);
        }

        userRepository.save(user);
    }

    @Override
    public void touchActivity(UUID userId) {
        userRepository.findById(userId).ifPresent(u -> {
            u.setUltimaAtividadeEm(LocalDateTime.now());
            userRepository.save(u);
        });
    }
}
