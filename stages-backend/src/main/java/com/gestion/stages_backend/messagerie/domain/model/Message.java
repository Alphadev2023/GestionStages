package com.gestion.stages_backend.messagerie.domain.model;

import com.gestion.stages_backend.identity.domain.model.User;
import com.gestion.stages_backend.shared.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Message extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expediteur_id", nullable = false)
    private User expediteur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destinataire_id", nullable = false)
    private User destinataire;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenu;

    @Builder.Default
    @Column(nullable = false)
    private boolean lu = false;

    private Long candidatureId;
}