package com.gestion.stages_backend.conventions.presentation;

import com.gestion.stages_backend.conventions.application.dto.ConventionRequest;
import com.gestion.stages_backend.conventions.application.dto.ConventionResponse;
import com.gestion.stages_backend.conventions.application.service.ConventionService;
import com.gestion.stages_backend.conventions.domain.model.StatutConvention;
import com.gestion.stages_backend.shared.application.dto.ApiResponse;
import com.gestion.stages_backend.shared.application.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conventions")
@RequiredArgsConstructor
@Tag(name = "Conventions de stage", description = "Workflow de validation des conventions")
public class ConventionController {

    private final ConventionService conventionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ENSEIGNANT')")
    @Operation(summary = "Créer une convention suite à une candidature acceptée")
    public ResponseEntity<ApiResponse<ConventionResponse>> creer(
            @Valid @RequestBody ConventionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Convention créée", conventionService.creer(request)));
    }

    @PatchMapping("/valider/{id}/enseignant")
    @PreAuthorize("hasRole('ENSEIGNANT')")
    @Operation(summary = "Validation enseignant")
    public ResponseEntity<ApiResponse<ConventionResponse>> validerEnseignant(
            @PathVariable Long id,
            @RequestParam(required = false) String commentaire) {
        return ResponseEntity.ok(ApiResponse.ok(
                conventionService.validerEnseignant(id, commentaire)));
    }

    @PatchMapping("/valider/{id}/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approbation admin")
    public ResponseEntity<ApiResponse<ConventionResponse>> approuverAdmin(
            @PathVariable Long id,
            @RequestParam(required = false) String commentaire) {
        return ResponseEntity.ok(ApiResponse.ok(
                conventionService.approuverAdmin(id, commentaire)));
    }

    @PatchMapping("/{id}/rejeter")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENSEIGNANT')")
    @Operation(summary = "Rejeter une convention")
    public ResponseEntity<ApiResponse<ConventionResponse>> rejeter(
            @PathVariable Long id,
            @RequestParam(required = false) String commentaire) {
        return ResponseEntity.ok(ApiResponse.ok(
                conventionService.rejeter(id, commentaire)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ENSEIGNANT')")
    @Operation(summary = "Liste des conventions par statut")
    public ResponseEntity<ApiResponse<PageResponse<ConventionResponse>>> liste(
            @RequestParam(required = false) StatutConvention statut,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                conventionService.findByStatut(statut, PageRequest.of(page, size))));
    }
}