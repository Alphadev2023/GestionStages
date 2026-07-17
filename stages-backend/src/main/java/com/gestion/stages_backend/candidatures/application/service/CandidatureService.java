package com.gestion.stages_backend.candidatures.application.service;

import com.gestion.stages_backend.candidatures.application.dto.CandidatureRequest;
import com.gestion.stages_backend.candidatures.application.dto.CandidatureResponse;
import com.gestion.stages_backend.candidatures.application.mapper.CandidatureMapper;
import com.gestion.stages_backend.candidatures.domain.model.Candidature;
import com.gestion.stages_backend.candidatures.domain.model.StatutCandidature;
import com.gestion.stages_backend.candidatures.infrastructure.persistence.JpaCandidatureRepository;
import com.gestion.stages_backend.candidatures.infrastructure.storage.MinioStorageService;
import com.gestion.stages_backend.conventions.domain.model.Convention;
import com.gestion.stages_backend.conventions.domain.model.StatutConvention;
import com.gestion.stages_backend.conventions.infrastructure.persistence.JpaConventionRepository;
import com.gestion.stages_backend.identity.domain.model.Role;
import com.gestion.stages_backend.identity.domain.model.User;
import com.gestion.stages_backend.identity.infrastructure.persistence.JpaUserRepository;
import com.gestion.stages_backend.offres.domain.model.Offre;
import com.gestion.stages_backend.offres.infrastructure.persistence.JpaOffreRepository;
import com.gestion.stages_backend.shared.application.dto.PageResponse;
import com.gestion.stages_backend.shared.infrastructure.exception.BusinessException;
import com.gestion.stages_backend.shared.infrastructure.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CandidatureService {

    private final JpaCandidatureRepository candidatureRepository;
    private final JpaUserRepository        userRepository;
    private final JpaOffreRepository       offreRepository;
    private final MinioStorageService      storageService;
    private final CandidatureMapper        candidatureMapper;
    private final JpaConventionRepository  conventionRepository;

    @Transactional
    public CandidatureResponse postuler(CandidatureRequest request, MultipartFile cv) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User etudiant = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Etudiant introuvable"));
        Offre offre = offreRepository.findById(request.getOffreId())
                .orElseThrow(() -> new ResourceNotFoundException("Offre", request.getOffreId()));
        if (candidatureRepository.existsByEtudiantIdAndOffreId(etudiant.getId(), offre.getId())) {
            throw new BusinessException("Vous avez deja postule a cette offre");
        }
        String cvUrl = storageService.uploadFile(cv, "cv/" + etudiant.getId());
        Candidature candidature = Candidature.builder()
                .etudiant(etudiant).offre(offre).cvUrl(cvUrl)
                .lettreMotivation(request.getLettreMotivation()).build();
        return candidatureMapper.toResponse(candidatureRepository.save(candidature));
    }

    @Transactional(readOnly = true)
    public PageResponse<CandidatureResponse> mesCandidatures(Pageable pageable) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User etudiant = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Etudiant introuvable"));
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
        candidatureRepository.save(candidature);
        if (statut == StatutCandidature.ACCEPTEE) {
            creerConventionAutomatique(candidature);
        }
        return candidatureMapper.toResponse(candidature);
    }

    private void creerConventionAutomatique(Candidature candidature) {
        if (conventionRepository.existsByCandidatureId(candidature.getId())) {
            return;
        }
        List<User> tousEnseignants = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ENSEIGNANT && u.isActif())
                .toList();
        if (tousEnseignants.isEmpty()) {
            log.warn("Aucun enseignant disponible");
            return;
        }
        String filiereEtudiant = candidature.getEtudiant().getFiliere();
        // Filtrer par departement correspondant a la filiere
        List<User> enseignantsFiliere = tousEnseignants.stream()
                .filter(e -> {
                    if (e.getDepartement() == null || filiereEtudiant == null) return false;
                    String dept = e.getDepartement().toLowerCase();
                    String fil  = filiereEtudiant.toLowerCase();
                    return dept.contains(fil) || fil.contains(dept);
                })
                .toList();
        // Fallback si aucun enseignant de la filiere
        List<User> enseignants = enseignantsFiliere.isEmpty() ? tousEnseignants : enseignantsFiliere;
        // Round-robin : prendre le moins charge
        User enseignantAssigne = enseignants.stream()
                .min(Comparator.comparingLong(e ->
                        conventionRepository.countByEnseignantIdAndStatut(
                                e.getId(), StatutConvention.EN_ATTENTE)))
                .orElse(enseignants.get(0));
        Offre offre = candidature.getOffre();
        LocalDate dateDebut = offre.getDateDebut().isAfter(LocalDate.now())
                ? offre.getDateDebut() : LocalDate.now().plusDays(7);
        LocalDate dateFin = dateDebut.plusMonths(offre.getDureeMois());
        Convention convention = Convention.builder()
                .candidature(candidature).enseignant(enseignantAssigne)
                .dateDebutStage(dateDebut).dateFinStage(dateFin).build();
        conventionRepository.save(convention);
        log.info("Convention creee — assigne a " + enseignantAssigne.getEmail());
    }
}