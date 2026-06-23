package com.gestion.stages_backend.identity.application.dto;

import com.gestion.stages_backend.identity.domain.model.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {
    private String token;
    private String email;
    private String nom;
    private String prenom;
    private Role role;
    private Long userId;
    private String nomEntreprise;
    private String secteurActivite;
    private String filiere;
    private String promotion;
    private String departement;
}
