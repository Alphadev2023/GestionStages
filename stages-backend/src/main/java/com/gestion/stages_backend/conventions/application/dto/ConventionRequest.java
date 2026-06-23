package com.gestion.stages_backend.conventions.application.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ConventionRequest {

    @NotNull
    private Long candidatureId;

    @NotNull
    private Long enseignantId;

    @NotNull
    private LocalDate dateDebutStage;

    @NotNull
    private LocalDate dateFinStage;
}