package com.gestion.stages_backend.offres.infrastructure.persistence;

import com.gestion.stages_backend.offres.domain.model.Offre;
import com.gestion.stages_backend.offres.domain.model.StatutOffre;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaOffreRepository extends JpaRepository<Offre, Long> {

    Page<Offre> findByStatut(StatutOffre statut, Pageable pageable);

    Page<Offre> findByEntrepriseId(Long entrepriseId, Pageable pageable);
}
