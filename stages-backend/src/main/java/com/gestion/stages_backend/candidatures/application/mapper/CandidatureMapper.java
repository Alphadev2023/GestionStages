package com.gestion.stages_backend.candidatures.application.mapper;

import com.gestion.stages_backend.candidatures.application.dto.CandidatureResponse;
import com.gestion.stages_backend.candidatures.domain.model.Candidature;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CandidatureMapper {

    @Mapping(target = "offreId", source = "offre.id")
    @Mapping(target = "titreOffre", source = "offre.titre")
    @Mapping(target = "nomEntreprise", source = "offre.entreprise.nomEntreprise")
    @Mapping(target = "etudiantId", source = "etudiant.id")
    @Mapping(target = "nomEtudiant", expression = "java(candidature.getEtudiant().getPrenom() + ' ' + candidature.getEtudiant().getNom())")
    CandidatureResponse toResponse(Candidature candidature);
}