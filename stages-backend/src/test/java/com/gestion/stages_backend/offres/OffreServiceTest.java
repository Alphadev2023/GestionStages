package com.gestion.stages_backend.offres;

import com.gestion.stages_backend.identity.domain.model.Role;
import com.gestion.stages_backend.identity.domain.model.User;
import com.gestion.stages_backend.identity.infrastructure.persistence.JpaUserRepository;
import com.gestion.stages_backend.offres.application.dto.OffreRequest;
import com.gestion.stages_backend.offres.application.dto.OffreResponse;
import com.gestion.stages_backend.offres.application.mapper.OffreMapper;
import com.gestion.stages_backend.offres.application.service.OffreService;
import com.gestion.stages_backend.offres.domain.model.Domaine;
import com.gestion.stages_backend.offres.domain.model.Offre;
import com.gestion.stages_backend.offres.domain.model.StatutOffre;
import com.gestion.stages_backend.offres.infrastructure.persistence.JpaOffreRepository;
import com.gestion.stages_backend.shared.application.dto.PageResponse;
import com.gestion.stages_backend.shared.infrastructure.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("OffreService — Tests unitaires")
class OffreServiceTest {

    @Mock JpaOffreRepository offreRepository;
    @Mock JpaUserRepository  userRepository;
    @Mock OffreMapper        offreMapper;

    @InjectMocks OffreService offreService;

    private User entreprise;
    private Offre offre;
    private OffreResponse offreResponse;

    @BeforeEach
    void setUp() {
        entreprise = User.builder()
                .id(2L).nom("Corp").prenom("Tech")
                .email("rh@corp.com").role(Role.ENTREPRISE)
                .nomEntreprise("TechCorp").build();

        offre = Offre.builder()
                .id(1L).titre("Dev Full Stack").description("Description")
                .domaine(Domaine.INFORMATIQUE).localisation("Conakry")
                .dureeMois(3).dateDebut(LocalDate.now())
                .dateExpiration(LocalDate.now().plusMonths(3))
                .statut(StatutOffre.ACTIVE).entreprise(entreprise).nombrePostes(1)
                .build();

        offreResponse = OffreResponse.builder()
                .id(1L).titre("Dev Full Stack").domaine(Domaine.INFORMATIQUE)
                .localisation("Conakry").dureeMois(3).statut(StatutOffre.ACTIVE)
                .entrepriseId(2L).nomEntreprise("TechCorp").build();

        // Mock SecurityContext
        Authentication auth = mock(Authentication.class);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        when(auth.getName()).thenReturn("rh@corp.com");
        SecurityContextHolder.setContext(ctx);
    }

    // ── PUBLIER ───────────────────────────────────────────
    @Test
    @DisplayName("publier — succes : offre sauvegardee avec entreprise")
    void publier_success() {
        OffreRequest req = new OffreRequest();
        req.setTitre("Dev Full Stack"); req.setDomaine(Domaine.INFORMATIQUE);

        when(userRepository.findByEmail("rh@corp.com")).thenReturn(Optional.of(entreprise));
        when(offreMapper.toEntity(req)).thenReturn(offre);
        when(offreRepository.save(offre)).thenReturn(offre);
        when(offreMapper.toResponse(offre)).thenReturn(offreResponse);

        OffreResponse res = offreService.publier(req);

        assertThat(res.getTitre()).isEqualTo("Dev Full Stack");
        assertThat(res.getNomEntreprise()).isEqualTo("TechCorp");
        verify(offreRepository).save(argThat(o -> o.getEntreprise().equals(entreprise)));
    }

    @Test
    @DisplayName("publier — echec : entreprise introuvable")
    void publier_entrepriseInconnue() {
        when(userRepository.findByEmail("rh@corp.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> offreService.publier(new OffreRequest()))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(offreRepository, never()).save(any());
    }

    // ── RECHERCHER ────────────────────────────────────────
    @Test
    @DisplayName("rechercher — retourne les offres actives paginées")
    void rechercher_retourneOffresActives() {
        var page = new PageImpl<>(List.of(offre), PageRequest.of(0,10), 1);
        when(offreRepository.findByStatut(StatutOffre.ACTIVE, PageRequest.of(0,10))).thenReturn(page);
        when(offreMapper.toResponse(offre)).thenReturn(offreResponse);

        PageResponse<OffreResponse> res = offreService.rechercher(null, null, null, PageRequest.of(0,10));

        assertThat(res.getContent()).hasSize(1);
        assertThat(res.getTotalElements()).isEqualTo(1);
        assertThat(res.getContent().get(0).getStatut()).isEqualTo(StatutOffre.ACTIVE);
    }

    @Test
    @DisplayName("rechercher — retourne liste vide si aucune offre active")
    void rechercher_aucuneOffre() {
        var page = new PageImpl<Offre>(List.of(), PageRequest.of(0,10), 0);
        when(offreRepository.findByStatut(StatutOffre.ACTIVE, PageRequest.of(0,10))).thenReturn(page);

        PageResponse<OffreResponse> res = offreService.rechercher(null, null, null, PageRequest.of(0,10));

        assertThat(res.getContent()).isEmpty();
        assertThat(res.getTotalElements()).isZero();
    }

    // ── FIND BY ID ────────────────────────────────────────
    @Test
    @DisplayName("findById — succes : retourne l offre")
    void findById_success() {
        when(offreRepository.findById(1L)).thenReturn(Optional.of(offre));
        when(offreMapper.toResponse(offre)).thenReturn(offreResponse);

        OffreResponse res = offreService.findById(1L);

        assertThat(res.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("findById — echec : offre introuvable")
    void findById_notFound() {
        when(offreRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> offreService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── ARCHIVER ──────────────────────────────────────────
    @Test
    @DisplayName("archiver — succes : statut passe a ARCHIVEE")
    void archiver_success() {
        when(offreRepository.findById(1L)).thenReturn(Optional.of(offre));
        when(offreRepository.save(offre)).thenReturn(offre);
        when(offreMapper.toResponse(offre)).thenReturn(
                OffreResponse.builder().id(1L).statut(StatutOffre.ARCHIVEE).build());

        OffreResponse res = offreService.archiver(1L);

        assertThat(res.getStatut()).isEqualTo(StatutOffre.ARCHIVEE);
        verify(offreRepository).save(argThat(o -> o.getStatut() == StatutOffre.ARCHIVEE));
    }

    @Test
    @DisplayName("archiver — echec : offre introuvable")
    void archiver_notFound() {
        when(offreRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> offreService.archiver(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
