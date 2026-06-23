package com.gestion.stages_backend.messagerie.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MessageRequest {

    @NotNull
    private Long destinataireId;

    @NotBlank
    private String contenu;

    private Long candidatureId;
}