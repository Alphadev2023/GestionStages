package com.gestion.stages_backend.notification.domain.model;

import com.gestion.stages_backend.identity.domain.model.User;
import com.gestion.stages_backend.shared.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destinataire_id", nullable = false)
    private User destinataire;

    @Column(nullable = false)
    private String titre;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String type;

    @Builder.Default
    @Column(nullable = false)
    private boolean lue = false;

    private Long referenceId;
}