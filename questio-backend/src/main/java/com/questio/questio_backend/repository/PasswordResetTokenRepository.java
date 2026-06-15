package com.questio.questio_backend.repository;

import com.questio.questio_backend.entity.PasswordResetToken;
import com.questio.questio_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByUsuario(User usuario);
}
