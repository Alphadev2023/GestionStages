package com.gestion.stages_backend.offres.presentation;

import com.gestion.stages_backend.offres.application.dto.OffreRequest;
import com.gestion.stages_backend.offres.application.dto.OffreResponse;
import com.gestion.stages_backend.offres.application.service.OffreService;
import com.gestion.stages_backend.offres.domain.model.Domaine;
import com.gestion.stages_backend.shared.application.dto.ApiResponse;
import com.gestion.stages_backend.shared.application.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/offres")
@RequiredArgsConstructor
@Tag(name = "Offres de stage", description = "Gestion des offres publiées par les entreprises")
public class OffreController {

    private final OffreService offreService;

    @PostMapping
    @PreAuthorize("hasRole('ENTREPRISE')")
    @Operation(summary = "Publier une offre de stage")
    public ResponseEntity<ApiResponse<OffreResponse>> publier(
            @Valid @RequestBody OffreRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Offre publiée avec succès", offreService.publier(request)));
    }

    @GetMapping
    @Operation(summary = "Recherche d''offres avec filtres")
    public ResponseEntity<ApiResponse<PageResponse<OffreResponse>>> rechercher(
            @RequestParam(required = false) Domaine domaine,
            @RequestParam(required = false) String localisation,
            @RequestParam(required = false) Integer dureeMois,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.ok(
                offreService.rechercher(domaine, localisation, dureeMois, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d''une offre")
    public ResponseEntity<ApiResponse<OffreResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(offreService.findById(id)));
    }

    @GetMapping("/mes-offres")
    @PreAuthorize("hasRole('ENTREPRISE')")
    @Operation(summary = "Offres de l''entreprise connectée")
    public ResponseEntity<ApiResponse<PageResponse<OffreResponse>>> mesOffres(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                offreService.mesOffres(PageRequest.of(page, size))));
    }

    @PatchMapping("/{id}/archiver")
    @PreAuthorize("hasRole('ENTREPRISE')")
    @Operation(summary = "Archiver une offre")
    public ResponseEntity<ApiResponse<OffreResponse>> archiver(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Offre archivée", offreService.archiver(id)));
    }
}