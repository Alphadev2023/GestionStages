package com.gestion.stages_backend.offres.application.dto;

import com.gestion.stages_backend.offres.domain.model.Domaine;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class OffreRequest {

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    @NotNull(message = "Le domaine est obligatoire")
    private Domaine domaine;

    @NotBlank(message = "La localisation est obligatoire")
    private String localisation;

    @NotNull
    @Min(value = 1, message = "La durée minimale est 1 mois")
    private Integer dureeMois;

    @NotNull
    private LocalDate dateDebut;

    @NotNull
    @Future(message = "La date d''expiration doit être dans le futur")
    private LocalDate dateExpiration;

    private Double remuneration;
    private String competencesRequises;

    @Min(value = 1)
    private Integer nombrePostes = 1;
}