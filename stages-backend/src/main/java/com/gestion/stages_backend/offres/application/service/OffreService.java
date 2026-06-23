package com.gestion.stages_backend.offres.application.service;

import com.gestion.stages_backend.identity.domain.model.User;
import com.gestion.stages_backend.identity.infrastructure.persistence.JpaUserRepository;
import com.gestion.stages_backend.offres.application.dto.OffreRequest;
import com.gestion.stages_backend.offres.application.dto.OffreResponse;
import com.gestion.stages_backend.offres.application.mapper.OffreMapper;
import com.gestion.stages_backend.offres.domain.model.Domaine;
import com.gestion.stages_backend.offres.domain.model.Offre;
import com.gestion.stages_backend.offres.domain.model.StatutOffre;
import com.gestion.stages_backend.offres.infrastructure.persistence.JpaOffreRepository;
import com.gestion.stages_backend.shared.application.dto.PageResponse;
import com.gestion.stages_backend.shared.infrastructure.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OffreService {

    private final JpaOffreRepository offreRepository;
    private final JpaUserRepository userRepository;
    private final OffreMapper offreMapper;

    @Transactional
    public OffreResponse publier(OffreRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User entreprise = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Entreprise introuvable"));
        Offre offre = offreMapper.toEntity(request);
        offre.setEntreprise(entreprise);
        return offreMapper.toResponse(offreRepository.save(offre));
    }

    @Transactional(readOnly = true)
    public PageResponse<OffreResponse> rechercher(Domaine domaine, String localisation,
                                                   Integer dureeMois, Pageable pageable) {
        return PageResponse.of(
                offreRepository.findByStatut(StatutOffre.ACTIVE, pageable)
                        .map(offreMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public OffreResponse findById(Long id) {
        return offreMapper.toResponse(offreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offre", id)));
    }

    @Transactional(readOnly = true)
    public PageResponse<OffreResponse> mesOffres(Pageable pageable) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User entreprise = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Entreprise introuvable"));
        return PageResponse.of(
                offreRepository.findByEntrepriseId(entreprise.getId(), pageable)
                        .map(offreMapper::toResponse));
    }

    @Transactional
    public OffreResponse archiver(Long id) {
        Offre offre = offreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offre", id));
        offre.setStatut(StatutOffre.ARCHIVEE);
        return offreMapper.toResponse(offreRepository.save(offre));
    }
}
