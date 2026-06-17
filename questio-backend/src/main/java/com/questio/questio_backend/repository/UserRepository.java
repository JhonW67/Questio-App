package com.questio.questio_backend.repository;


import com.questio.questio_backend.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {"turmas"})
    Optional<User> findByIdUsuario(UUID idUsuario);

    long countByTipoUsuarioIgnoreCase(String tipoUsuario);

    List<User> findTop10ByOrderByXpTotalDesc();

    long countByXpTotalGreaterThan(int xpTotal);

    List<User> findTop10ByTipoUsuarioIgnoreCaseOrderByXpTotalDesc(String tipoUsuario);

    long countByTipoUsuarioIgnoreCaseAndXpTotalGreaterThan(String tipoUsuario, int xpTotal);

    List<User> findByUltimaAtividadeEmBeforeAndStreakAtualGreaterThan(java.time.LocalDateTime data, Integer streakAtual);

    List<User> findByUltimoCheckinEmBeforeAndStreakAtualGreaterThan(java.time.LocalDateTime data, Integer streakAtual);

    List<User> findByTipoUsuarioIgnoreCaseOrderByNomeAsc(String tipoUsuario);
}
