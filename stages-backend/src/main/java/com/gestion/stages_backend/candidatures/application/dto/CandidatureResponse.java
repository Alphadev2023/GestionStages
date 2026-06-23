package com.gestion.stages_backend.candidatures.application.dto;

import com.gestion.stages_backend.candidatures.domain.model.StatutCandidature;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CandidatureResponse {
    private Long id;
    private Long offreId;
    private String titreOffre;
    private String nomEntreprise;
    private Long etudiantId;
    private String nomEtudiant;
    private String cvUrl;
    private String lettreMotivation;
    private StatutCandidature statut;
    private String feedbackEntreprise;
    private LocalDateTime createdAt;
}