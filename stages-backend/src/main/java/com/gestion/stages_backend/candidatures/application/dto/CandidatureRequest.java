package com.gestion.stages_backend.candidatures.application.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CandidatureRequest {

    @NotNull(message = "L''id de l''offre est obligatoire")
    private Long offreId;

    private String lettreMotivation;
}