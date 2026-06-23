package com.gestion.stages_backend.conventions.domain.model;

import com.gestion.stages_backend.candidatures.domain.model.Candidature;
import com.gestion.stages_backend.identity.domain.model.User;
import com.gestion.stages_backend.shared.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "conventions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Convention extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidature_id", nullable = false)
    private Candidature candidature;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enseignant_id")
    private User enseignant;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutConvention statut = StatutConvention.EN_ATTENTE;

    private String conventionUrl;
    private LocalDateTime dateValidationEnseignant;
    private LocalDateTime dateApprouveAdmin;

    @Column(columnDefinition = "TEXT")
    private String commentaireEnseignant;

    @Column(columnDefinition = "TEXT")
    private String commentaireAdmin;

    private LocalDate dateDebutStage;
    private LocalDate dateFinStage;
}