package com.questio.questio_backend.repository;

import com.questio.questio_backend.entity.TaskMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskMaterialRepository extends JpaRepository<TaskMaterial, UUID> {
    List<TaskMaterial> findByTarefaIdTaskOrderByEnviadoEmAsc(UUID idTarefa);
    List<TaskMaterial> findByTarefaIdTaskIn(List<UUID> idsTarefa);
}
