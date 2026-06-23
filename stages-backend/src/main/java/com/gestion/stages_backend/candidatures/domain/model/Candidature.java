package com.gestion.stages_backend.candidatures.domain.model;

import com.gestion.stages_backend.identity.domain.model.User;
import com.gestion.stages_backend.offres.domain.model.Offre;
import com.gestion.stages_backend.shared.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidatures",
       uniqueConstraints = @UniqueConstraint(columnNames = {"etudiant_id", "offre_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Candidature extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "etudiant_id", nullable = false)
    private User etudiant;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "offre_id", nullable = false)
    private Offre offre;

    @Column(nullable = false)
    private String cvUrl;

    @Column(columnDefinition = "TEXT")
    private String lettreMotivation;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutCandidature statut = StatutCandidature.EN_ATTENTE;

    @Column(columnDefinition = "TEXT")
    private String feedbackEntreprise;
}
