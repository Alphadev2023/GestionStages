package com.gestion.stages_backend.identity.domain.model;

import com.gestion.stages_backend.shared.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String motDePasse;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Builder.Default
    @Column(nullable = false)
    private boolean actif = true;

    // ETUDIANT
    private String filiere;
    private String promotion;

    // ENTREPRISE
    private String nomEntreprise;
    private String secteurActivite;

    // ENSEIGNANT
    private String departement;
}