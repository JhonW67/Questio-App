package com.questio.questio_backend.repository;


import com.questio.questio_backend.entity.SubmitTask;
import com.questio.questio_backend.entity.Task;
import com.questio.questio_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubmitRepository extends JpaRepository<SubmitTask, UUID> {

     boolean existsByAlunoAndTarefa(User aluno, Task tarefa);

     List<SubmitTask> findByAluno(User aluno);

}
