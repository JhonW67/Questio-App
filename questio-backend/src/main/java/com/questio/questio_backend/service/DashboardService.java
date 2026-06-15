package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.DashboardResumoDTO;
import com.questio.questio_backend.dto.CursoDashboardDTO;
import java.util.List;

public interface DashboardService {
    DashboardResumoDTO obterResumoGeral();
    List<CursoDashboardDTO> listarCursosComAlunos();
}