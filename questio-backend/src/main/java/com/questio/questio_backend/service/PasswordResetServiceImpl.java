package com.questio.questio_backend.service;

import com.questio.questio_backend.entity.PasswordResetToken;
import com.questio.questio_backend.entity.User;
import com.questio.questio_backend.repository.PasswordResetTokenRepository;
import com.questio.questio_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl {
    private static final int RESET_TOKEN_EXPIRATION_MINUTES = 15;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.password-reset.url:questio-app://screens/(Authenticator)/ResetPassWord}")
    private String passwordResetUrl;

    @Transactional
    public void solicitarReset(String email) {
        User usuario = userRepository.findByEmail(email).orElse(null);
        if (usuario == null) {
            return;
        }

        tokenRepository.deleteByUsuario(usuario);

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .usuario(usuario)
                .dataExpiracao(LocalDateTime.now().plusMinutes(RESET_TOKEN_EXPIRATION_MINUTES))
                .build();

        tokenRepository.save(resetToken);

        String linkReset = UriComponentsBuilder.fromUriString(passwordResetUrl)
                .queryParam("token", token)
                .queryParam("email", usuario.getEmail())
                .build()
                .toUriString();

        emailService.enviarEmailResetSenha(
                usuario.getEmail(),
                usuario.getNome(),
                linkReset,
                RESET_TOKEN_EXPIRATION_MINUTES
        );
    }

    @Transactional
    public void resetarSenha(String token, String novaSenha) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido"));

        if (resetToken.isExpirado()) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("Este token expirou. Solicite um novo.");
        }

        User usuario = resetToken.getUsuario();
        usuario.setSenha(passwordEncoder.encode(novaSenha));

        userRepository.save(usuario);


        tokenRepository.delete(resetToken);
    }
}
