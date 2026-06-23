package com.gestion.stages_backend.identity.application.dto;

import com.gestion.stages_backend.identity.domain.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @Email(message = "Email invalide")
    @NotBlank(message = "L''email est obligatoire")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String motDePasse;

    private String telephone;

    @NotNull(message = "Le rôle est obligatoire")
    private Role role;

    // ETUDIANT
    private String filiere;
    private String promotion;

    // ENTREPRISE
    private String nomEntreprise;
    private String secteurActivite;

    // ENSEIGNANT
    private String departement;
}