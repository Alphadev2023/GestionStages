package com.gestion.stages_backend.offres.domain.repository;

import com.gestion.stages_backend.offres.domain.model.Domaine;
import com.gestion.stages_backend.offres.domain.model.Offre;
import com.gestion.stages_backend.offres.domain.model.StatutOffre;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OffreRepository {
    Page<Offre> findByFilters(Domaine domaine, String localisation,
                              Integer dureeMois, StatutOffre statut, Pageable pageable);
    Page<Offre> findByEntrepriseId(Long entrepriseId, Pageable pageable);
}
