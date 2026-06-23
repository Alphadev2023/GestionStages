package com.gestion.stages_backend.notification.domain.event;

public record ConventionValideeEvent(
        Long conventionId,
        String emailEtudiant,
        String nomEtudiant,
        String statut
) {}