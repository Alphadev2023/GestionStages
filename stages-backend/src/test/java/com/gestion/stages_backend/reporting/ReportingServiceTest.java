package com.gestion.stages_backend.reporting;

import com.gestion.stages_backend.candidatures.infrastructure.persistence.JpaCandidatureRepository;
import com.gestion.stages_backend.conventions.infrastructure.persistence.JpaConventionRepository;
import com.gestion.stages_backend.offres.infrastructure.persistence.JpaOffreRepository;
import com.gestion.stages_backend.reporting.application.service.ReportingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReportingService — Tests unitaires")
class ReportingServiceTest {

    @Mock JpaOffreRepository        offreRepository;
    @Mock JpaCandidatureRepository  candidatureRepository;
    @Mock JpaConventionRepository   conventionRepository;

    @InjectMocks ReportingService reportingService;

    @Test
    @DisplayName("getStatistiques — retourne les compteurs corrects")
    void getStatistiques_retourneCompteurs() {
        when(offreRepository.count()).thenReturn(5L);
        when(candidatureRepository.count()).thenReturn(12L);
        when(conventionRepository.count()).thenReturn(3L);

        Map<String, Long> stats = reportingService.getStatistiques();

        assertThat(stats).containsEntry("totalOffres", 5L)
                         .containsEntry("totalCandidatures", 12L)
                         .containsEntry("totalConventions", 3L);
    }

    @Test
    @DisplayName("getStatistiques — retourne zeros si aucune donnee")
    void getStatistiques_zeros() {
        when(offreRepository.count()).thenReturn(0L);
        when(candidatureRepository.count()).thenReturn(0L);
        when(conventionRepository.count()).thenReturn(0L);

        Map<String, Long> stats = reportingService.getStatistiques();

        assertThat(stats.values()).allMatch(v -> v == 0L);
    }

    @Test
    @DisplayName("exporterStagesExcel — genere un fichier Excel non vide")
    void exporterExcel_genereFichier() throws IOException {
        when(candidatureRepository.findAll()).thenReturn(java.util.List.of());

        byte[] excel = reportingService.exporterStagesExcel();

        assertThat(excel).isNotNull().isNotEmpty();
        // Signature XLSX : commence par PK (ZIP)
        assertThat(excel[0]).isEqualTo((byte) 0x50);
        assertThat(excel[1]).isEqualTo((byte) 0x4B);
    }
}