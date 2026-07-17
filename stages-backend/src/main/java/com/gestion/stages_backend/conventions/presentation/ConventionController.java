package com.gestion.stages_backend.conventions.presentation;

import com.gestion.stages_backend.conventions.application.dto.ConventionRequest;
import com.gestion.stages_backend.conventions.application.dto.ConventionResponse;
import com.gestion.stages_backend.conventions.application.service.ConventionService;
import com.gestion.stages_backend.conventions.domain.model.StatutConvention;
import com.gestion.stages_backend.shared.application.dto.ApiResponse;
import com.gestion.stages_backend.shared.application.dto.PageResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conventions")
@RequiredArgsConstructor
@Tag(name = "Conventions de stage")
public class ConventionController {

    private final ConventionService conventionService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ENSEIGNANT')")
    public ResponseEntity<ApiResponse<ConventionResponse>> creer(
            @Valid @RequestBody ConventionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Convention creee", conventionService.creer(request)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ENSEIGNANT')")
    public ResponseEntity<ApiResponse<PageResponse<ConventionResponse>>> liste(
            @RequestParam(required = false) StatutConvention statut,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        PageResponse<ConventionResponse> result;
        if (isAdmin) {
            result = conventionService.findByStatut(statut, PageRequest.of(page, size));
        } else {
            result = conventionService.findByEnseignant(email, statut, PageRequest.of(page, size));
        }
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PatchMapping("/valider/{id}/enseignant")
    @PreAuthorize("hasRole('ENSEIGNANT')")
    public ResponseEntity<ApiResponse<ConventionResponse>> validerEnseignant(
            @PathVariable Long id,
            @RequestParam(required = false) String commentaire) {
        return ResponseEntity.ok(ApiResponse.ok(
                conventionService.validerEnseignant(id, commentaire)));
    }

    @PatchMapping("/valider/{id}/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ConventionResponse>> approuverAdmin(
            @PathVariable Long id,
            @RequestParam(required = false) String commentaire) {
        return ResponseEntity.ok(ApiResponse.ok(
                conventionService.approuverAdmin(id, commentaire)));
    }

    @PatchMapping("/{id}/rejeter")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ENSEIGNANT')")
    public ResponseEntity<ApiResponse<ConventionResponse>> rejeter(
            @PathVariable Long id,
            @RequestParam(required = false) String commentaire) {
        return ResponseEntity.ok(ApiResponse.ok(
                conventionService.rejeter(id, commentaire)));
    }
}