package com.gestion.stages_backend.candidatures.presentation;

import com.gestion.stages_backend.candidatures.application.dto.CandidatureRequest;
import com.gestion.stages_backend.candidatures.application.dto.CandidatureResponse;
import com.gestion.stages_backend.candidatures.application.service.CandidatureService;
import com.gestion.stages_backend.candidatures.domain.model.StatutCandidature;
import com.gestion.stages_backend.shared.application.dto.ApiResponse;
import com.gestion.stages_backend.shared.application.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/candidatures")
@RequiredArgsConstructor
@Tag(name = "Candidatures", description = "Dépôt et gestion des candidatures")
public class CandidatureController {

    private final CandidatureService candidatureService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ETUDIANT')")
    @Operation(summary = "Postuler à une offre (avec upload CV)")
    public ResponseEntity<ApiResponse<CandidatureResponse>> postuler(
            @RequestPart("data") @Valid CandidatureRequest request,
            @RequestPart("cv") MultipartFile cv) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Candidature déposée", candidatureService.postuler(request, cv)));
    }

    @GetMapping("/mes-candidatures")
    @PreAuthorize("hasRole('ETUDIANT')")
    @Operation(summary = "Mes candidatures (étudiant connecté)")
    public ResponseEntity<ApiResponse<PageResponse<CandidatureResponse>>> mesCandidatures(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                candidatureService.mesCandidatures(PageRequest.of(page, size))));
    }

    @GetMapping("/offre/{offreId}")
    @PreAuthorize("hasRole('ENTREPRISE')")
    @Operation(summary = "Candidatures reçues pour une offre")
    public ResponseEntity<ApiResponse<PageResponse<CandidatureResponse>>> parOffre(
            @PathVariable Long offreId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                candidatureService.candidaturesPourOffre(offreId, PageRequest.of(page, size))));
    }

    @PatchMapping("/{id}/traiter")
    @PreAuthorize("hasRole('ENTREPRISE')")
    @Operation(summary = "Accepter ou refuser une candidature")
    public ResponseEntity<ApiResponse<CandidatureResponse>> traiter(
            @PathVariable Long id,
            @RequestParam StatutCandidature statut,
            @RequestParam(required = false) String feedback) {
        return ResponseEntity.ok(ApiResponse.ok(
                candidatureService.traiter(id, statut, feedback)));
    }
}