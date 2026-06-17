package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.AcademicEventRequestDTO;
import com.questio.questio_backend.dto.AcademicEventResponseDTO;
import com.questio.questio_backend.entity.AcademicEvent;
import com.questio.questio_backend.entity.Class;
import com.questio.questio_backend.entity.Disciplina;
import com.questio.questio_backend.entity.User;
import com.questio.questio_backend.entity.enums.TipoUsuario;
import com.questio.questio_backend.repository.AcademicEventRepository;
import com.questio.questio_backend.repository.ClassRepository;
import com.questio.questio_backend.repository.DisciplinaRepository;
import com.questio.questio_backend.repository.TurmaOfertaRepository;
import com.questio.questio_backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AcademicEventService {

    private static final Set<String> TIPOS_VALIDOS = Set.of(
            "reuniao",
            "aviso",
            "comunicado",
            "importante"
    );

    private final AcademicEventRepository academicEventRepository;
    private final UserRepository userRepository;
    private final ClassRepository classRepository;
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
    public AcademicEventResponseDTO criar(AcademicEventRequestDTO dto) {
        User professor = userRepository.findById(dto.idProfessor())
                .orElseThrow(() -> new RuntimeException("Professor não encontrado"));

        boolean isProfessor = professor.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_PROFESSOR"));

        if (!isProfessor) {
            throw new RuntimeException("O usuário selecionado não possui perfil de Professor.");
        }

        String tipo = dto.tipo().trim().toLowerCase();
        if (!TIPOS_VALIDOS.contains(tipo)) {
            throw new RuntimeException("Tipo de evento inválido.");
        }

        Class turma = null;
        if (dto.idTurma() != null) {
            turma = classRepository.findById(dto.idTurma())
                    .orElseThrow(() -> new RuntimeException("Turma não encontrada"));
        }

        Disciplina disciplina = null;
        if (dto.idDisciplina() != null) {
            disciplina = disciplinaRepository.findById(dto.idDisciplina())
                    .orElseThrow(() -> new RuntimeException("Disciplina não encontrada"));
        }

        if (turma != null) {
            if (disciplina != null) {
                boolean vinculado = turmaOfertaRepository.findByTurmaIdClassAndDisciplinaIdDisciplinaAndProfessorIdUsuario(
                        turma.getIdClass(),
                        disciplina.getIdDisciplina(),
                        professor.getIdUsuario()
                ).isPresent();
                if (!vinculado) {
                    throw new RuntimeException("O professor informado não está vinculado à disciplina selecionada nesta turma.");
                }
            } else {
                boolean vinculado = turmaOfertaRepository.existsByTurmaIdClassAndProfessorIdUsuario(
                        turma.getIdClass(),
                        professor.getIdUsuario()
                );
                if (!vinculado) {
                    throw new RuntimeException("O professor informado não está vinculado a esta turma.");
                }
            }
        }

        User aluno = null;
        if (dto.idAluno() != null) {
            aluno = userRepository.findById(dto.idAluno())
                    .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

            TipoUsuario tipoUsuarioAluno = TipoUsuario.fromString(aluno.getTipoUsuario());
            if (tipoUsuarioAluno != TipoUsuario.ALUNO) {
                throw new RuntimeException("O destinatário selecionado não é um aluno.");
            }

            UUID idAlunoSelecionado = aluno.getIdUsuario();
            if (turma != null && turma.getAlunos().stream().noneMatch(item -> item.getIdUsuario().equals(idAlunoSelecionado))) {
                throw new RuntimeException("O aluno selecionado não está matriculado na turma informada.");
            }
        }

        AcademicEvent evento = AcademicEvent.builder()
                .professor(professor)
                .turma(turma)
                .disciplina(disciplina)
                .aluno(aluno)
                .titulo(dto.tituloEvento().trim())
                .descricao(dto.descricaoEvento().trim())
                .dataEvento(dto.dataEvento())
                .tipo(tipo)
                .lido(false)
                .build();

        return map(academicEventRepository.save(evento));
    }

    @Transactional
    public List<AcademicEventResponseDTO> listarTodos() {
        return academicEventRepository.findAllByOrderByDataEventoDescCriadoEmDesc().stream()
                .map(this::map)
                .toList();
    }

    @Transactional
    public List<AcademicEventResponseDTO> listarDoProfessorAutenticado() {
        User professor = getUsuarioAutenticado();

        return academicEventRepository.findVisiveisParaProfessor(professor.getIdUsuario()).stream()
                .map(this::map)
                .toList();
    }

    @Transactional
    public AcademicEventResponseDTO marcarComoLido(UUID idEvento) {
        User professor = getUsuarioAutenticado();

        AcademicEvent evento = academicEventRepository.findById(idEvento)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));

        if (evento.getProfessor() == null || !evento.getProfessor().getIdUsuario().equals(professor.getIdUsuario())) {
            throw new RuntimeException("Você não tem permissão para atualizar este evento.");
        }

        evento.setLido(true);
        return map(academicEventRepository.save(evento));
    }

    private AcademicEventResponseDTO map(AcademicEvent evento) {
        return new AcademicEventResponseDTO(
                evento.getIdEvento(),
                evento.getProfessor() != null ? evento.getProfessor().getIdUsuario() : null,
                evento.getProfessor() != null ? evento.getProfessor().getNome() : null,
                evento.getTurma() != null ? evento.getTurma().getIdClass() : null,
                evento.getTurma() != null ? evento.getTurma().getNome() : null,
                evento.getDisciplina() != null ? evento.getDisciplina().getIdDisciplina() : null,
                evento.getDisciplina() != null ? evento.getDisciplina().getNome() : null,
                evento.getAluno() != null ? evento.getAluno().getIdUsuario() : null,
                evento.getAluno() != null ? evento.getAluno().getNome() : null,
                evento.getTitulo(),
                evento.getDescricao(),
                evento.getDataEvento(),
                evento.getTipo(),
                Boolean.TRUE.equals(evento.getLido())
        );
    }
}
