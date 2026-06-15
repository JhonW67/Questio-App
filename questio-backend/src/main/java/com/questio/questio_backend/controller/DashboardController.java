package com.questio.questio_backend.controller;

import com.questio.questio_backend.dto.DashboardResumoDTO;
import com.questio.questio_backend.dto.CursoDashboardDTO;
import com.questio.questio_backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/coordenacao/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('COORDENACAO')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/resumo")
    public ResponseEntity<DashboardResumoDTO> getResumoGeral() {
        return ResponseEntity.ok(dashboardService.obterResumoGeral());
    }

    @GetMapping("/cursos-alunos")
    public ResponseEntity<List<CursoDashboardDTO>> getCursosComAlunos() {
        return ResponseEntity.ok(dashboardService.listarCursosComAlunos());
    }
}