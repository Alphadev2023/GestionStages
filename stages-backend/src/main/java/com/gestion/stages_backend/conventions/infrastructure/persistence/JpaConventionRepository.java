package com.gestion.stages_backend.conventions.infrastructure.persistence;

import com.gestion.stages_backend.conventions.domain.model.Convention;
import com.gestion.stages_backend.conventions.domain.model.StatutConvention;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaConventionRepository extends JpaRepository<Convention, Long> {
    Page<Convention> findByStatut(StatutConvention statut, Pageable pageable);
    Page<Convention> findByEnseignantId(Long enseignantId, Pageable pageable);
}
