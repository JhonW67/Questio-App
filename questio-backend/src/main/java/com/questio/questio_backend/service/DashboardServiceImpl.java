package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.DashboardResumoDTO;
import com.questio.questio_backend.dto.CursoDashboardDTO;
import com.questio.questio_backend.entity.enums.TipoUsuario;
import com.questio.questio_backend.repository.CursoRepository;
import com.questio.questio_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final CursoRepository cursoRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardResumoDTO obterResumoGeral() {
        long alunos = userRepository.countByTipoUsuario(TipoUsuario.ALUNO);
        long professores = userRepository.countByTipoUsuario(TipoUsuario.PROFESSOR);
        long cursosAtivos = cursoRepository.countByAtivoTrue();

        return new DashboardResumoDTO(alunos, professores, cursosAtivos);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CursoDashboardDTO> listarCursosComAlunos() {
        return cursoRepository.findCursosAtivosComQuantidadeDeAlunos();
    }
}
