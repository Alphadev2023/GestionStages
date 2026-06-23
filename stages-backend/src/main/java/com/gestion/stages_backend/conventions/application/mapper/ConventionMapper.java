package com.gestion.stages_backend.conventions.application.mapper;

import com.gestion.stages_backend.conventions.application.dto.ConventionResponse;
import com.gestion.stages_backend.conventions.domain.model.Convention;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ConventionMapper {

    @Mapping(target = "candidatureId", source = "candidature.id")
    @Mapping(target = "nomEtudiant", expression = "java(convention.getCandidature().getEtudiant().getPrenom() + ' ' + convention.getCandidature().getEtudiant().getNom())")
    @Mapping(target = "titreOffre", source = "candidature.offre.titre")
    @Mapping(target = "nomEntreprise", source = "candidature.offre.entreprise.nomEntreprise")
    @Mapping(target = "enseignantId", source = "enseignant.id")
    @Mapping(target = "nomEnseignant", expression = "java(convention.getEnseignant() != null ? convention.getEnseignant().getPrenom() + ' ' + convention.getEnseignant().getNom() : null)")
    ConventionResponse toResponse(Convention convention);
}