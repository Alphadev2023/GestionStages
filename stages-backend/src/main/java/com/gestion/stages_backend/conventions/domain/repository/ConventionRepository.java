package com.gestion.stages_backend.conventions.domain.repository;

import com.gestion.stages_backend.conventions.domain.model.Convention;
import com.gestion.stages_backend.conventions.domain.model.StatutConvention;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ConventionRepository {
    Page<Convention> findByStatut(StatutConvention statut, Pageable pageable);
    Page<Convention> findByEnseignantId(Long enseignantId, Pageable pageable);
}
