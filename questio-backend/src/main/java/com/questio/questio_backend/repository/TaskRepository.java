package com.questio.questio_backend.repository;

import com.questio.questio_backend.entity.Class;
import com.questio.questio_backend.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByTurmaIn(Set<Class> turmas);
}
