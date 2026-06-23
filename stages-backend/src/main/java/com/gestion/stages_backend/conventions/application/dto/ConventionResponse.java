package com.gestion.stages_backend.conventions.application.dto;

import com.gestion.stages_backend.conventions.domain.model.StatutConvention;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class ConventionResponse {
    private Long id;
    private Long candidatureId;
    private String nomEtudiant;
    private String titreOffre;
    private String nomEntreprise;
    private Long enseignantId;
    private String nomEnseignant;
    private StatutConvention statut;
    private String conventionUrl;
    private LocalDate dateDebutStage;
    private LocalDate dateFinStage;
    private LocalDateTime dateValidationEnseignant;
    private LocalDateTime dateApprouveAdmin;
    private String commentaireEnseignant;
    private String commentaireAdmin;
    private LocalDateTime createdAt;
}