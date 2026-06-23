package com.gestion.stages_backend.candidatures.domain.repository;

import com.gestion.stages_backend.candidatures.domain.model.Candidature;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CandidatureRepository {
    Page<Candidature> findByEtudiantId(Long etudiantId, Pageable pageable);
    Page<Candidature> findByOffreId(Long offreId, Pageable pageable);
    boolean existsByEtudiantIdAndOffreId(Long etudiantId, Long offreId);
}
