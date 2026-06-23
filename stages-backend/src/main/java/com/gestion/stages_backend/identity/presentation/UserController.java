package com.gestion.stages_backend.identity.presentation;

import com.gestion.stages_backend.identity.infrastructure.persistence.JpaUserRepository;
import com.gestion.stages_backend.shared.application.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Utilisateurs")
public class UserController {

    private final JpaUserRepository userRepository;

    // Contacts pour messagerie (tous sauf soi-meme)
    @GetMapping("/contacts")
    public ResponseEntity<ApiResponse<List<ContactResponse>>> getContacts() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<ContactResponse> contacts = userRepository.findAll().stream()
                .filter(u -> !u.getEmail().equals(email))
                .map(this::toContact)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(contacts));
    }

    // Tous les utilisateurs pour admin (y compris soi-meme)
    @GetMapping("/all")
    @PreAuthorize("hasRole(\"ADMIN\")")
    public ResponseEntity<ApiResponse<List<ContactResponse>>> getAllUsers() {
        List<ContactResponse> users = userRepository.findAll().stream()
                .map(this::toContact)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    // Activer/desactiver un utilisateur
    @PatchMapping("/{id}/toggle-actif")
    @PreAuthorize("hasRole(\"ADMIN\")")
    public ResponseEntity<ApiResponse<String>> toggleActif(@PathVariable Long id) {
        return userRepository.findById(id).map(u -> {
            u.setActif(!u.isActif());
            userRepository.save(u);
            String msg = u.isActif() ? "Compte active" : "Compte desactive";
            return ResponseEntity.ok(ApiResponse.ok(msg));
        }).orElse(ResponseEntity.notFound().build());
    }

    private ContactResponse toContact(com.gestion.stages_backend.identity.domain.model.User u) {
        return new ContactResponse(
            u.getId(),
            u.getPrenom() + " " + u.getNom(),
            u.getEmail(),
            u.getRole().name(),
            u.getNomEntreprise(),
            u.isActif()
        );
    }

    public record ContactResponse(
            Long id,
            String nomComplet,
            String email,
            String role,
            String nomEntreprise,
            boolean actif
    ) {}
}
