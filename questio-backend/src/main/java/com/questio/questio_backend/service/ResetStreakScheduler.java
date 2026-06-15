package com.questio.questio_backend.service;

import com.questio.questio_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "questio.scheduling.reset-streak.enabled", havingValue = "true")
public class ResetStreakScheduler {

    private final UserRepository userRepository;

    @Scheduled(cron = "0 0 3 * * *")
    public void resetarStreaks() {
        LocalDateTime limite = LocalDateTime.now().minusDays(1);
        // O streak depende do último check-in (não de qualquer atividade).
        var usuarios = userRepository.findByUltimoCheckinEmBeforeAndStreakAtualGreaterThan(limite, 0);

        for (var u : usuarios) {
            u.setStreakAtual(0);
        }
        userRepository.saveAll(usuarios);
    }
}
