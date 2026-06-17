package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.ClassRequestDTO;
import com.questio.questio_backend.dto.ClassResponseDTO;
import com.questio.questio_backend.dto.EnrolmentRequestDTO;
import com.questio.questio_backend.entity.Curso;
import com.questio.questio_backend.entity.Disciplina;
import com.questio.questio_backend.entity.enums.TipoUsuario;
import com.questio.questio_backend.entity.User;
import com.questio.questio_backend.repository.ClassRepository;
import com.questio.questio_backend.repository.CursoRepository;
import com.questio.questio_backend.repository.DisciplinaRepository;
import com.questio.questio_backend.repository.UserRepository;
import com.questio.questio_backend.entity.Class;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final UserRepository userRepository;
    private final ClassRepository turmaRepository;
    private final CursoRepository cursoRepository;
    private final DisciplinaRepository disciplinaRepository;

    private User getUsuarioAutenticado() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new RuntimeException("Usuário não autenticado");
        }

        return user;
    }

    @Transactional
    public ClassResponseDTO criarTurma(ClassRequestDTO dto) {

        User usuario = (User) userRepository.findById(dto.idProfessor())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        Curso curso = cursoRepository.findById(dto.idCurso())
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));
        Disciplina disciplina = disciplinaRepository.findById(dto.idDisciplina())
                .orElseThrow(() -> new RuntimeException("Disciplina não encontrada"));

        boolean isProfessor = usuario.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PROFESSOR"));

        if (!isProfessor) {
            throw new RuntimeException("Operação Inválida: O usuário selecionado não possui perfil de Professor.");
        }

        if (!disciplina.getCurso().getIdCurso().equals(curso.getIdCurso())) {
            throw new RuntimeException("A disciplina selecionada não pertence ao curso informado.");
        }

        if (!disciplina.getSemestre().equals(dto.semestre())) {
            throw new RuntimeException("A disciplina selecionada não pertence ao semestre informado.");
        }

        Class novaTurma = Class.builder()
                .nome(dto.nome())
                .professor(usuario)
                .curso(curso)
                .disciplina(disciplina)
                .semestre(dto.semestre())
                .build();

        return mapToDTO(turmaRepository.save(novaTurma));
    }

    private ClassResponseDTO mapToDTO(Class turma) {
        return new ClassResponseDTO(
                turma.getIdClass(),
                turma.getCurso() != null ? turma.getCurso().getIdCurso() : null,
                turma.getDisciplina() != null ? turma.getDisciplina().getIdDisciplina() : null,
                turma.getProfessor() != null ? turma.getProfessor().getIdUsuario() : null,
                turma.getNome(),
                turma.getCurso() != null ? turma.getCurso().getNome() : null,
                turma.getDisciplina() != null ? turma.getDisciplina().getNome() : null,
                turma.getProfessor() != null ? turma.getProfessor().getNome() : null,
                turma.getSemestre(),
                turma.isAtiva()
        );
    }

    @Transactional
    public List<ClassResponseDTO> listarTurmasVisiveis() {
        User usuario = getUsuarioAutenticado();
        TipoUsuario tipoUsuario = TipoUsuario.fromString(usuario.getTipoUsuario());

        List<Class> turmas = tipoUsuario == TipoUsuario.PROFESSOR
                ? turmaRepository.findByProfessorIdUsuarioOrderByNomeAsc(usuario.getIdUsuario())
                : turmaRepository.findAllByOrderByNomeAsc();

        return turmas.stream().map(this::mapToDTO).toList();
    }

    @Transactional
    public void matricularAlunos(EnrolmentRequestDTO dto) {
        Class turma = turmaRepository.findById(dto.idTurma())
                .orElseThrow(() -> new RuntimeException("Turma não encontrada"));

        List<User> usuarios = userRepository.findAllById(dto.idsAlunos());

        for (User usuario : usuarios) {
            boolean isAluno = usuario.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ALUNO"));

            if (!isAluno) {
                throw new RuntimeException("O usuário " + usuario.getNome() + " não é um Aluno e não pode ser matriculado.");
            }

            turma.getAlunos().add(usuario);
            usuario.getTurmas().add(turma);
        }
        turmaRepository.save(turma);
    }

    @Transactional
    public void deletarTurma(UUID idTurma) {
        if (!turmaRepository.existsById(idTurma)) {
            throw new RuntimeException("Turma não encontrada");
        }
        turmaRepository.deleteById(idTurma);
    }
}
