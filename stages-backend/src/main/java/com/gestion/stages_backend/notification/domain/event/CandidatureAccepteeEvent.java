package com.gestion.stages_backend.notification.domain.event;

public record CandidatureAccepteeEvent(
        Long candidatureId,
        String emailEtudiant,
        String nomEtudiant,
        String titreOffre,
        boolean acceptee
) {}