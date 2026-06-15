package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.UserResponseDTO;

import java.util.UUID;

public interface GamificationService {
    UserResponseDTO checkin(UUID userId);
    void addXp(UUID userId, int xp);
    void touchActivity(UUID userId);
}
