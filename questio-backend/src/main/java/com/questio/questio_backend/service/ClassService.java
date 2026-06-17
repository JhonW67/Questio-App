package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.EnrolmentRequestDTO;
import com.questio.questio_backend.dto.TurmaCreateRequestDTO;
import com.questio.questio_backend.dto.TurmaOfertaRequestDTO;
import com.questio.questio_backend.dto.TurmaOfertaResponseDTO;
import com.questio.questio_backend.dto.TurmaResponseDTO;
import com.questio.questio_backend.entity.Curso;
import com.questio.questio_backend.entity.Disciplina;
import com.questio.questio_backend.entity.enums.TipoUsuario;
import com.questio.questio_backend.entity.TurmaOferta;
import com.questio.questio_backend.entity.User;
import com.questio.questio_backend.repository.ClassRepository;
import com.questio.questio_backend.repository.CursoRepository;
import com.questio.questio_backend.repository.DisciplinaRepository;
import com.questio.questio_backend.repository.TurmaOfertaRepository;
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
    private final TurmaOfertaRepository turmaOfertaRepository;

    private User getUsuarioAutenticado() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new RuntimeException("Usuário não autenticado");
        }

        return user;
    }

    @Transactional
    public TurmaResponseDTO criarTurma(TurmaCreateRequestDTO dto) {
        Curso curso = cursoRepository.findById(dto.idCurso())
                .orElseThrow(() -> new RuntimeException("Curso não encontrado"));

        Class novaTurma = Class.builder()
                .nome(dto.nome())
                .curso(curso)
                .semestre(dto.semestre())
                .build();

        Class turmaPersistida = turmaRepository.save(novaTurma);

        if (dto.ofertas() != null) {
            for (TurmaOfertaRequestDTO oferta : dto.ofertas()) {
                adicionarOfertaInterna(turmaPersistida, curso, dto.semestre(), oferta);
            }
        }

        Class recarregada = turmaRepository.findById(turmaPersistida.getIdClass())
                .orElseThrow(() -> new RuntimeException("Turma não encontrada"));

        return mapToDTO(recarregada);
    }

    @Transactional
    public TurmaOfertaResponseDTO adicionarOferta(UUID idTurma, TurmaOfertaRequestDTO dto) {
        Class turma = turmaRepository.findById(idTurma)
                .orElseThrow(() -> new RuntimeException("Turma não encontrada"));
        Curso curso = turma.getCurso() != null
                ? turma.getCurso()
                : null;
        if (curso == null || curso.getIdCurso() == null) {
            throw new RuntimeException("Turma sem curso vinculado.");
        }
        Integer semestre = turma.getSemestre();
        if (semestre == null) {
            throw new RuntimeException("Turma sem semestre definido.");
        }

        TurmaOferta oferta = adicionarOfertaInterna(turma, curso, semestre, dto);
        return mapOferta(oferta);
    }

    private TurmaOferta adicionarOfertaInterna(
            Class turma,
            Curso curso,
            Integer semestreTurma,
            TurmaOfertaRequestDTO dto
    ) {
        if (dto == null) {
            throw new RuntimeException("Oferta inválida.");
        }

        if (turmaOfertaRepository.existsByTurmaIdClassAndDisciplinaIdDisciplina(turma.getIdClass(), dto.idDisciplina())) {
            throw new RuntimeException("Essa disciplina já está cadastrada nesta turma.");
        }

        User professor = userRepository.findById(dto.idProfessor())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        boolean isProfessor = professor.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PROFESSOR"));

        if (!isProfessor) {
            throw new RuntimeException("Operação Inválida: O usuário selecionado não possui perfil de Professor.");
        }

        Disciplina disciplina = disciplinaRepository.findById(dto.idDisciplina())
                .orElseThrow(() -> new RuntimeException("Disciplina não encontrada"));

        if (disciplina.getCurso() == null || disciplina.getCurso().getIdCurso() == null
                || !disciplina.getCurso().getIdCurso().equals(curso.getIdCurso())) {
            throw new RuntimeException("A disciplina selecionada não pertence ao curso informado.");
        }

        if (disciplina.getSemestre() == null || !disciplina.getSemestre().equals(semestreTurma)) {
            throw new RuntimeException("A disciplina selecionada não pertence ao semestre informado.");
        }

        TurmaOferta oferta = TurmaOferta.builder()
                .turma(turma)
                .disciplina(disciplina)
                .professor(professor)
                .ativa(true)
                .build();

        return turmaOfertaRepository.save(oferta);
    }

    private TurmaResponseDTO mapToDTO(Class turma) {
        return new TurmaResponseDTO(
                turma.getIdClass(),
                turma.getCurso() != null ? turma.getCurso().getIdCurso() : null,
                turma.getCurso() != null ? turma.getCurso().getNome() : null,
                turma.getNome(),
                turma.getSemestre(),
                turma.isAtiva(),
                turma.getOfertas() == null
                        ? List.of()
                        : turma.getOfertas().stream().map(this::mapOferta).toList()
        );
    }

    @Transactional
    public List<TurmaResponseDTO> listarTurmasVisiveis() {
        User usuario = getUsuarioAutenticado();
        TipoUsuario tipoUsuario = TipoUsuario.fromString(usuario.getTipoUsuario());

        List<Class> turmas = tipoUsuario == TipoUsuario.PROFESSOR
                ? turmaRepository.findDistinctByOfertasProfessorIdUsuarioOrderByNomeAsc(usuario.getIdUsuario())
                : turmaRepository.findAllByOrderByNomeAsc();

        return turmas.stream().map(this::mapToDTO).toList();
    }

    private TurmaOfertaResponseDTO mapOferta(TurmaOferta oferta) {
        return new TurmaOfertaResponseDTO(
                oferta.getIdOferta(),
                oferta.getDisciplina() != null ? oferta.getDisciplina().getIdDisciplina() : null,
                oferta.getDisciplina() != null ? oferta.getDisciplina().getNome() : null,
                oferta.getProfessor() != null ? oferta.getProfessor().getIdUsuario() : null,
                oferta.getProfessor() != null ? oferta.getProfessor().getNome() : null,
                oferta.getAtiva()
        );
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
