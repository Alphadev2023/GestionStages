package com.gestion.stages_backend.reporting.presentation;

import com.gestion.stages_backend.reporting.application.service.ReportingService;
import com.gestion.stages_backend.shared.application.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/reporting")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Reporting", description = "Statistiques et exports admin")
public class ReportingController {

    private final ReportingService reportingService;

    @GetMapping("/statistiques")
    @Operation(summary = "Statistiques globales")
    public ResponseEntity<ApiResponse<Map<String, Long>>> statistiques() {
        return ResponseEntity.ok(ApiResponse.ok(reportingService.getStatistiques()));
    }

    @GetMapping("/export/stages")
    @Operation(summary = "Export Excel de tous les stages")
    public ResponseEntity<byte[]> exporterExcel() throws IOException {
        byte[] excel = reportingService.exporterStagesExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=stages.xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }
}