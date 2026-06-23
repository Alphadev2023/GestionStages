package com.gestion.stages_backend.conventions.application.service;

import com.gestion.stages_backend.candidatures.domain.model.Candidature;
import com.gestion.stages_backend.candidatures.infrastructure.persistence.JpaCandidatureRepository;
import com.gestion.stages_backend.conventions.application.dto.ConventionRequest;
import com.gestion.stages_backend.conventions.application.dto.ConventionResponse;
import com.gestion.stages_backend.conventions.application.mapper.ConventionMapper;
import com.gestion.stages_backend.conventions.domain.model.Convention;
import com.gestion.stages_backend.conventions.domain.model.StatutConvention;
import com.gestion.stages_backend.conventions.infrastructure.persistence.JpaConventionRepository;
import com.gestion.stages_backend.identity.domain.model.User;
import com.gestion.stages_backend.identity.infrastructure.persistence.JpaUserRepository;
import com.gestion.stages_backend.shared.application.dto.PageResponse;
import com.gestion.stages_backend.shared.infrastructure.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ConventionService {

    private final JpaConventionRepository conventionRepository;
    private final JpaCandidatureRepository candidatureRepository;
    private final JpaUserRepository userRepository;
    private final ConventionMapper conventionMapper;

    @Transactional
    public ConventionResponse creer(ConventionRequest request) {
        Candidature candidature = candidatureRepository.findById(request.getCandidatureId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidature", request.getCandidatureId()));
        User enseignant = userRepository.findById(request.getEnseignantId())
                .orElseThrow(() -> new ResourceNotFoundException("Enseignant", request.getEnseignantId()));

        Convention convention = Convention.builder()
                .candidature(candidature)
                .enseignant(enseignant)
                .dateDebutStage(request.getDateDebutStage())
                .dateFinStage(request.getDateFinStage())
                .build();

        return conventionMapper.toResponse(conventionRepository.save(convention));
    }

    @Transactional
    public ConventionResponse validerEnseignant(Long id, String commentaire) {
        Convention convention = conventionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Convention", id));
        convention.setStatut(StatutConvention.VALIDEE_ENSEIGNANT);
        convention.setCommentaireEnseignant(commentaire);
        convention.setDateValidationEnseignant(LocalDateTime.now());
        return conventionMapper.toResponse(conventionRepository.save(convention));
    }

    @Transactional
    public ConventionResponse approuverAdmin(Long id, String commentaire) {
        Convention convention = conventionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Convention", id));
        convention.setStatut(StatutConvention.APPROUVEE_ADMIN);
        convention.setCommentaireAdmin(commentaire);
        convention.setDateApprouveAdmin(LocalDateTime.now());
        return conventionMapper.toResponse(conventionRepository.save(convention));
    }

    @Transactional
    public ConventionResponse rejeter(Long id, String commentaire) {
        Convention convention = conventionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Convention", id));
        convention.setStatut(StatutConvention.REJETEE);
        convention.setCommentaireAdmin(commentaire);
        return conventionMapper.toResponse(conventionRepository.save(convention));
    }

    @Transactional(readOnly = true)
    public PageResponse<ConventionResponse> findByStatut(StatutConvention statut, Pageable pageable) {
        if (statut == null) {
            // Retourner toutes les conventions sans filtre
            return PageResponse.of(
                conventionRepository.findAll(pageable)
                    .map(conventionMapper::toResponse));
        }
        return PageResponse.of(
            conventionRepository.findByStatut(statut, pageable)
                .map(conventionMapper::toResponse));
    }
}
