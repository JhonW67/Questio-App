package com.questio.questio_backend.controller;

import com.questio.questio_backend.dto.UserResponseDTO;
import com.questio.questio_backend.entity.User;
import com.questio.questio_backend.repository.UserRepository;
import com.questio.questio_backend.service.GamificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;
    private final UserRepository userRepository;

    @PostMapping("/checkin")
    public ResponseEntity<UserResponseDTO> realizarCheckin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("Usuário não autenticado");
        }

        String email = auth.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        UserResponseDTO response = gamificationService.checkin(user.getIdUsuario());

        return ResponseEntity.ok(response);

    }

}
