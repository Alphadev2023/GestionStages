package com.gestion.stages_backend.candidatures.infrastructure.persistence;

import com.gestion.stages_backend.candidatures.domain.model.Candidature;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaCandidatureRepository extends JpaRepository<Candidature, Long> {
    Page<Candidature> findByEtudiantId(Long etudiantId, Pageable pageable);
    Page<Candidature> findByOffreId(Long offreId, Pageable pageable);
    boolean existsByEtudiantIdAndOffreId(Long etudiantId, Long offreId);
}
