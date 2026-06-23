package com.gestion.stages_backend.messagerie.application.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MessageResponse {
    private Long id;
    private Long expediteurId;
    private String nomExpediteur;
    private Long destinataireId;
    private String nomDestinataire;
    private String contenu;
    private boolean lu;
    private Long candidatureId;
    private LocalDateTime createdAt;
}