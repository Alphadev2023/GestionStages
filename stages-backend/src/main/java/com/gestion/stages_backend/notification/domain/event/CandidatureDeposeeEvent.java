package com.gestion.stages_backend.notification.domain.event;

public record CandidatureDeposeeEvent(
        Long candidatureId,
        String emailEtudiant,
        String nomEtudiant,
        String titreOffre,
        String emailEntreprise
) {}