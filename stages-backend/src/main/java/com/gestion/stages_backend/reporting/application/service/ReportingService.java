package com.gestion.stages_backend.reporting.application.service;

import com.gestion.stages_backend.candidatures.infrastructure.persistence.JpaCandidatureRepository;
import com.gestion.stages_backend.conventions.infrastructure.persistence.JpaConventionRepository;
import com.gestion.stages_backend.offres.infrastructure.persistence.JpaOffreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportingService {

    private final JpaOffreRepository offreRepository;
    private final JpaCandidatureRepository candidatureRepository;
    private final JpaConventionRepository conventionRepository;

    @Transactional(readOnly = true)
    public Map<String, Long> getStatistiques() {
        return Map.of(
                "totalOffres",       offreRepository.count(),
                "totalCandidatures", candidatureRepository.count(),
                "totalConventions",  conventionRepository.count()
        );
    }

    @Transactional(readOnly = true)
    public byte[] exporterStagesExcel() throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Stages");

            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            String[] colonnes = {"ID", "Etudiant", "Offre", "Entreprise", "Statut", "Date"};
            Row header = sheet.createRow(0);
            for (int i = 0; i < colonnes.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(colonnes[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            for (var c : candidatureRepository.findAll()) {
                try {
                    Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue(c.getId());
                    row.createCell(1).setCellValue(
                        c.getEtudiant().getPrenom() + " " + c.getEtudiant().getNom());
                    row.createCell(2).setCellValue(c.getOffre().getTitre());
                    row.createCell(3).setCellValue(
                        c.getOffre().getEntreprise().getNomEntreprise() != null
                            ? c.getOffre().getEntreprise().getNomEntreprise()
                            : c.getOffre().getEntreprise().getNom());
                    row.createCell(4).setCellValue(c.getStatut().name());
                    row.createCell(5).setCellValue(
                        c.getCreatedAt() != null ? c.getCreatedAt().toString() : "");
                } catch (Exception e) {
                    log.warn("Erreur ligne candidature {}", c.getId(), e);
                }
            }

            for (int i = 0; i < colonnes.length; i++) sheet.autoSizeColumn(i);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }
}
