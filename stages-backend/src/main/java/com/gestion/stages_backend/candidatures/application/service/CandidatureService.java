package com.gestion.stages_backend.candidatures.application.service;

import com.gestion.stages_backend.candidatures.application.dto.CandidatureRequest;
import com.gestion.stages_backend.candidatures.application.dto.CandidatureResponse;
import com.gestion.stages_backend.candidatures.application.mapper.CandidatureMapper;
import com.gestion.stages_backend.candidatures.domain.model.Candidature;
import com.gestion.stages_backend.candidatures.domain.model.StatutCandidature;
import com.gestion.stages_backend.candidatures.infrastructure.persistence.JpaCandidatureRepository;
import com.gestion.stages_backend.candidatures.infrastructure.storage.MinioStorageService;
import com.gestion.stages_backend.identity.domain.model.User;
import com.gestion.stages_backend.identity.infrastructure.persistence.JpaUserRepository;
import com.gestion.stages_backend.offres.domain.model.Offre;
import com.gestion.stages_backend.offres.infrastructure.persistence.JpaOffreRepository;
import com.gestion.stages_backend.shared.application.dto.PageResponse;
import com.gestion.stages_backend.shared.infrastructure.exception.BusinessException;
import com.gestion.stages_backend.shared.infrastructure.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class CandidatureService {

    private final JpaCandidatureRepository candidatureRepository;
    private final JpaUserRepository userRepository;
    private final JpaOffreRepository offreRepository;
    private final MinioStorageService storageService;
    private final CandidatureMapper candidatureMapper;

    @Transactional
    public CandidatureResponse postuler(CandidatureRequest request, MultipartFile cv) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User etudiant = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable"));

        Offre offre = offreRepository.findById(request.getOffreId())
                .orElseThrow(() -> new ResourceNotFoundException("Offre", request.getOffreId()));

        if (candidatureRepository.existsByEtudiantIdAndOffreId(etudiant.getId(), offre.getId())) {
            throw new BusinessException("Vous avez déjà postulé à cette offre");
        }

        String cvUrl = storageService.uploadFile(cv, "cv/" + etudiant.getId());

        Candidature candidature = Candidature.builder()
                .etudiant(etudiant)
                .offre(offre)
                .cvUrl(cvUrl)
                .lettreMotivation(request.getLettreMotivation())
                .build();

        return candidatureMapper.toResponse(candidatureRepository.save(candidature));
    }

    @Transactional(readOnly = true)
    public PageResponse<CandidatureResponse> mesCandidatures(Pageable pageable) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User etudiant = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable"));
        return PageResponse.of(
                candidatureRepository.findByEtudiantId(etudiant.getId(), pageable)
                        .map(candidatureMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public PageResponse<CandidatureResponse> candidaturesPourOffre(Long offreId, Pageable pageable) {
        return PageResponse.of(
                candidatureRepository.findByOffreId(offreId, pageable)
                        .map(candidatureMapper::toResponse));
    }

    @Transactional
    public CandidatureResponse traiter(Long id, StatutCandidature statut, String feedback) {
        Candidature candidature = candidatureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature", id));
        candidature.setStatut(statut);
        candidature.setFeedbackEntreprise(feedback);
        return candidatureMapper.toResponse(candidatureRepository.save(candidature));
    }
}