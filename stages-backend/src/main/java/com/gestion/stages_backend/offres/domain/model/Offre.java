package com.gestion.stages_backend.offres.domain.model;

import com.gestion.stages_backend.identity.domain.model.User;
import com.gestion.stages_backend.shared.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "offres")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Offre extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Domaine domaine;

    @Column(nullable = false)
    private String localisation;

    @Column(nullable = false)
    private Integer dureeMois;

    @Column(nullable = false)
    private LocalDate dateDebut;

    private LocalDate dateFin;

    @Column(nullable = false)
    private LocalDate dateExpiration;

    @Column(name = "remuneration")
    private Double remuneration;

    @Column(columnDefinition = "TEXT")
    private String competencesRequises;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutOffre statut = StatutOffre.ACTIVE;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "entreprise_id", nullable = false)
    private User entreprise;

    @Builder.Default
    @Column(nullable = false)
    private Integer nombrePostes = 1;
}
