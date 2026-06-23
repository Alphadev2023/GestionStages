package com.gestion.stages_backend.offres.application.dto;

import com.gestion.stages_backend.offres.domain.model.Domaine;
import com.gestion.stages_backend.offres.domain.model.StatutOffre;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class OffreResponse {
    private Long id;
    private String titre;
    private String description;
    private Domaine domaine;
    private String localisation;
    private Integer dureeMois;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private LocalDate dateExpiration;
    private Double remuneration;
    private String competencesRequises;
    private StatutOffre statut;
    private Integer nombrePostes;
    private Long entrepriseId;
    private String nomEntreprise;
    private LocalDateTime createdAt;
}