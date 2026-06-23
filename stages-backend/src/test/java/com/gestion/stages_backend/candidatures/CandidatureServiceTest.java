package com.gestion.stages_backend.candidatures;

import com.gestion.stages_backend.candidatures.application.dto.CandidatureRequest;
import com.gestion.stages_backend.candidatures.application.dto.CandidatureResponse;
import com.gestion.stages_backend.candidatures.application.mapper.CandidatureMapper;
import com.gestion.stages_backend.candidatures.application.service.CandidatureService;
import com.gestion.stages_backend.candidatures.domain.model.Candidature;
import com.gestion.stages_backend.candidatures.domain.model.StatutCandidature;
import com.gestion.stages_backend.candidatures.infrastructure.persistence.JpaCandidatureRepository;
import com.gestion.stages_backend.candidatures.infrastructure.storage.MinioStorageService;
import com.gestion.stages_backend.identity.domain.model.Role;
import com.gestion.stages_backend.identity.domain.model.User;
import com.gestion.stages_backend.identity.infrastructure.persistence.JpaUserRepository;
import com.gestion.stages_backend.offres.domain.model.Domaine;
import com.gestion.stages_backend.offres.domain.model.Offre;
import com.gestion.stages_backend.offres.domain.model.StatutOffre;
import com.gestion.stages_backend.offres.infrastructure.persistence.JpaOffreRepository;
import com.gestion.stages_backend.shared.infrastructure.exception.BusinessException;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("CandidatureService — Tests unitaires")
class CandidatureServiceTest {

    @Mock JpaCandidatureRepository candidatureRepository;
    @Mock JpaUserRepository        userRepository;
    @Mock JpaOffreRepository       offreRepository;
    @Mock MinioStorageService      storageService;
    @Mock CandidatureMapper        candidatureMapper;

    @InjectMocks CandidatureService candidatureService;

    private User etudiant;
    private Offre offre;
    private Candidature candidature;
    private CandidatureResponse candidatureResponse;

    @BeforeEach
    void setUp() {
        etudiant = User.builder()
                .id(3L).nom("Diallo").prenom("Mamadou")
                .email("etudiant@uni.com").role(Role.ETUDIANT).build();

        User entreprise = User.builder()
                .id(2L).nom("Corp").prenom("Tech")
                .email("rh@corp.com").role(Role.ENTREPRISE)
                .nomEntreprise("TechCorp").build();

        offre = Offre.builder()
                .id(1L).titre("Dev Full Stack")
                .description("Description").domaine(Domaine.INFORMATIQUE)
                .localisation("Conakry").dureeMois(3)
                .dateDebut(LocalDate.now())
                .dateExpiration(LocalDate.now().plusMonths(3))
                .statut(StatutOffre.ACTIVE).entreprise(entreprise).nombrePostes(1)
                .build();

        candidature = Candidature.builder()
                .id(1L).etudiant(etudiant).offre(offre)
                .cvUrl("http://localhost:8082/files/cv/1/cv.pdf")
                .lettreMotivation("Je suis motive")
                .statut(StatutCandidature.EN_ATTENTE).build();

        candidatureResponse = CandidatureResponse.builder()
                .id(1L).offreId(1L).titreOffre("Dev Full Stack")
                .nomEntreprise("TechCorp").etudiantId(3L)
                .nomEtudiant("Mamadou Diallo")
                .statut(StatutCandidature.EN_ATTENTE).build();

        Authentication auth = mock(Authentication.class);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        when(auth.getName()).thenReturn("etudiant@uni.com");
        SecurityContextHolder.setContext(ctx);
    }

    // ── POSTULER ──────────────────────────────────────────
    @Test
    @DisplayName("postuler — succes : candidature creee avec CV uploade")
    void postuler_success() {
        CandidatureRequest req = new CandidatureRequest();
        req.setOffreId(1L); req.setLettreMotivation("Je suis motive");

        MockMultipartFile cv = new MockMultipartFile("cv", "cv.pdf",
                "application/pdf", "pdf-content".getBytes());

        when(userRepository.findByEmail("etudiant@uni.com")).thenReturn(Optional.of(etudiant));
        when(offreRepository.findById(1L)).thenReturn(Optional.of(offre));
        when(candidatureRepository.existsByEtudiantIdAndOffreId(3L, 1L)).thenReturn(false);
        when(storageService.uploadFile(cv, "cv/3")).thenReturn("http://localhost:8082/files/cv/3/cv.pdf");
        when(candidatureRepository.save(any(Candidature.class))).thenReturn(candidature);
        when(candidatureMapper.toResponse(candidature)).thenReturn(candidatureResponse);

        CandidatureResponse res = candidatureService.postuler(req, cv);

        assertThat(res.getStatut()).isEqualTo(StatutCandidature.EN_ATTENTE);
        assertThat(res.getTitreOffre()).isEqualTo("Dev Full Stack");
        verify(storageService).uploadFile(cv, "cv/3");
        verify(candidatureRepository).save(any(Candidature.class));
    }

    @Test
    @DisplayName("postuler — echec : candidature deja existante")
    void postuler_doublonRejete() {
        CandidatureRequest req = new CandidatureRequest();
        req.setOffreId(1L);

        MockMultipartFile cv = new MockMultipartFile("cv","cv.pdf",
                "application/pdf", new byte[0]);

        when(userRepository.findByEmail("etudiant@uni.com")).thenReturn(Optional.of(etudiant));
        when(offreRepository.findById(1L)).thenReturn(Optional.of(offre));
        when(candidatureRepository.existsByEtudiantIdAndOffreId(3L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> candidatureService.postuler(req, cv))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("postul");

        verify(storageService, never()).uploadFile(any(), any());
        verify(candidatureRepository, never()).save(any());
    }

    @Test
    @DisplayName("postuler — echec : offre introuvable")
    void postuler_offreIntrouvable() {
        CandidatureRequest req = new CandidatureRequest();
        req.setOffreId(99L);

        when(userRepository.findByEmail("etudiant@uni.com")).thenReturn(Optional.of(etudiant));
        when(offreRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> candidatureService.postuler(req,
                new MockMultipartFile("cv","cv.pdf","application/pdf",new byte[0])))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── TRAITER ───────────────────────────────────────────
    @Test
    @DisplayName("traiter — accepter : statut passe a ACCEPTEE")
    void traiter_accepter() {
        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(candidature)).thenReturn(candidature);
        when(candidatureMapper.toResponse(candidature)).thenReturn(
                CandidatureResponse.builder().id(1L).statut(StatutCandidature.ACCEPTEE).build());

        CandidatureResponse res = candidatureService.traiter(1L, StatutCandidature.ACCEPTEE, "Excellent profil");

        assertThat(res.getStatut()).isEqualTo(StatutCandidature.ACCEPTEE);
        verify(candidatureRepository).save(argThat(c ->
                c.getStatut() == StatutCandidature.ACCEPTEE &&
                "Excellent profil".equals(c.getFeedbackEntreprise())
        ));
    }

    @Test
    @DisplayName("traiter — refuser : statut passe a REFUSEE avec feedback")
    void traiter_refuser() {
        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(candidature)).thenReturn(candidature);
        when(candidatureMapper.toResponse(candidature)).thenReturn(
                CandidatureResponse.builder().id(1L).statut(StatutCandidature.REFUSEE)
                        .feedbackEntreprise("Profil ne correspond pas").build());

        CandidatureResponse res = candidatureService.traiter(1L, StatutCandidature.REFUSEE, "Profil ne correspond pas");

        assertThat(res.getStatut()).isEqualTo(StatutCandidature.REFUSEE);
        assertThat(res.getFeedbackEntreprise()).isEqualTo("Profil ne correspond pas");
    }

    @Test
    @DisplayName("traiter — echec : candidature introuvable")
    void traiter_notFound() {
        when(candidatureRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> candidatureService.traiter(99L, StatutCandidature.ACCEPTEE, null))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}

