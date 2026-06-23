package com.gestion.stages_backend.offres.application.mapper;

import com.gestion.stages_backend.offres.application.dto.OffreRequest;
import com.gestion.stages_backend.offres.application.dto.OffreResponse;
import com.gestion.stages_backend.offres.domain.model.Offre;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OffreMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "statut", ignore = true)
    @Mapping(target = "entreprise", ignore = true)
    @Mapping(target = "dateFin", ignore = true)
    Offre toEntity(OffreRequest request);

    @Mapping(target = "entrepriseId", source = "entreprise.id")
    @Mapping(target = "nomEntreprise", source = "entreprise.nomEntreprise")
    @Mapping(target = "createdAt", source = "createdAt")
    OffreResponse toResponse(Offre offre);
}
