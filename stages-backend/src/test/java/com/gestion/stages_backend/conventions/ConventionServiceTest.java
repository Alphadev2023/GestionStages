package com.gestion.stages_backend.conventions;

import com.gestion.stages_backend.candidatures.domain.model.Candidature;
import com.gestion.stages_backend.candidatures.domain.model.StatutCandidature;
import com.gestion.stages_backend.candidatures.infrastructure.persistence.JpaCandidatureRepository;
import com.gestion.stages_backend.conventions.application.dto.ConventionRequest;
import com.gestion.stages_backend.conventions.application.dto.ConventionResponse;
import com.gestion.stages_backend.conventions.application.mapper.ConventionMapper;
import com.gestion.stages_backend.conventions.application.service.ConventionService;
import com.gestion.stages_backend.conventions.domain.model.Convention;
import com.gestion.stages_backend.conventions.domain.model.StatutConvention;
import com.gestion.stages_backend.conventions.infrastructure.persistence.JpaConventionRepository;
import com.gestion.stages_backend.identity.domain.model.Role;
import com.gestion.stages_backend.identity.domain.model.User;
import com.gestion.stages_backend.identity.infrastructure.persistence.JpaUserRepository;
import com.gestion.stages_backend.offres.domain.model.Domaine;
import com.gestion.stages_backend.offres.domain.model.Offre;
import com.gestion.stages_backend.offres.domain.model.StatutOffre;
import com.gestion.stages_backend.shared.infrastructure.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ConventionService — Tests unitaires")
class ConventionServiceTest {

    @Mock JpaConventionRepository  conventionRepository;
    @Mock JpaCandidatureRepository candidatureRepository;
    @Mock JpaUserRepository        userRepository;
    @Mock ConventionMapper         conventionMapper;

    @InjectMocks ConventionService conventionService;

    private User etudiant;
    private User enseignant;
    private Offre offre;
    private Candidature candidature;
    private Convention convention;
    private ConventionResponse conventionResponse;

    @BeforeEach
    void setUp() {
        etudiant = User.builder().id(3L).nom("Diallo").prenom("Mamadou")
                .email("etudiant@uni.com").role(Role.ETUDIANT).build();

        enseignant = User.builder().id(4L).nom("Camara").prenom("Ibrahim")
                .email("enseignant@uni.com").role(Role.ENSEIGNANT)
                .departement("Informatique").build();

        User entreprise = User.builder().id(2L).nom("Corp").prenom("Tech")
                .email("rh@corp.com").role(Role.ENTREPRISE)
                .nomEntreprise("TechCorp").build();

        offre = Offre.builder().id(1L).titre("Dev Full Stack")
                .description("Desc").domaine(Domaine.INFORMATIQUE)
                .localisation("Conakry").dureeMois(3)
                .dateDebut(LocalDate.now())
                .dateExpiration(LocalDate.now().plusMonths(3))
                .statut(StatutOffre.ACTIVE).entreprise(entreprise).nombrePostes(1).build();

        candidature = Candidature.builder().id(1L).etudiant(etudiant).offre(offre)
                .cvUrl("http://localhost:8082/files/cv/1/cv.pdf")
                .statut(StatutCandidature.ACCEPTEE).build();

        convention = Convention.builder().id(1L).candidature(candidature)
                .enseignant(enseignant).statut(StatutConvention.EN_ATTENTE)
                .dateDebutStage(LocalDate.of(2026,7,1))
                .dateFinStage(LocalDate.of(2026,9,30)).build();

        conventionResponse = ConventionResponse.builder()
                .id(1L).candidatureId(1L)
                .nomEtudiant("Mamadou Diallo").titreOffre("Dev Full Stack")
                .nomEntreprise("TechCorp").enseignantId(4L)
                .nomEnseignant("Ibrahim Camara")
                .statut(StatutConvention.EN_ATTENTE)
                .dateDebutStage(LocalDate.of(2026, 7, 1))
                .dateFinStage(LocalDate.of(2026, 9, 30))
                .build();
    }

    // ── CREER ─────────────────────────────────────────────
    @Test
    @DisplayName("creer — succes : convention creee avec candidature et enseignant")
    void creer_success() {
        ConventionRequest req = new ConventionRequest();
        req.setCandidatureId(1L); req.setEnseignantId(4L);
        req.setDateDebutStage(LocalDate.of(2026,7,1));
        req.setDateFinStage(LocalDate.of(2026,9,30));

        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));
        when(userRepository.findById(4L)).thenReturn(Optional.of(enseignant));
        when(conventionRepository.save(any(Convention.class))).thenReturn(convention);
        when(conventionMapper.toResponse(convention)).thenReturn(conventionResponse);

        ConventionResponse res = conventionService.creer(req);

        assertThat(res.getStatut()).isEqualTo(StatutConvention.EN_ATTENTE);
        assertThat(res.getNomEtudiant()).isEqualTo("Mamadou Diallo");
        assertThat(res.getNomEnseignant()).isEqualTo("Ibrahim Camara");

        verify(conventionRepository).save(argThat(c ->
                c.getCandidature().equals(candidature) &&
                c.getEnseignant().equals(enseignant)
        ));
    }

    @Test
    @DisplayName("creer — echec : candidature introuvable")
    void creer_candidatureIntrouvable() {
        ConventionRequest req = new ConventionRequest();
        req.setCandidatureId(99L); req.setEnseignantId(4L);

        when(candidatureRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> conventionService.creer(req))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(conventionRepository, never()).save(any());
    }

    @Test
    @DisplayName("creer — echec : enseignant introuvable")
    void creer_enseignantIntrouvable() {
        ConventionRequest req = new ConventionRequest();
        req.setCandidatureId(1L); req.setEnseignantId(99L);

        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> conventionService.creer(req))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── VALIDER ENSEIGNANT ────────────────────────────────
    @Test
    @DisplayName("validerEnseignant — succes : statut passe a VALIDEE_ENSEIGNANT")
    void validerEnseignant_success() {
        when(conventionRepository.findById(1L)).thenReturn(Optional.of(convention));
        when(conventionRepository.save(convention)).thenReturn(convention);
        when(conventionMapper.toResponse(convention)).thenReturn(
                ConventionResponse.builder().id(1L)
                        .statut(StatutConvention.VALIDEE_ENSEIGNANT)
                        .commentaireEnseignant("Valide").build());

        ConventionResponse res = conventionService.validerEnseignant(1L, "Valide");

        assertThat(res.getStatut()).isEqualTo(StatutConvention.VALIDEE_ENSEIGNANT);
        assertThat(res.getCommentaireEnseignant()).isEqualTo("Valide");

        verify(conventionRepository).save(argThat(c ->
                c.getStatut() == StatutConvention.VALIDEE_ENSEIGNANT &&
                "Valide".equals(c.getCommentaireEnseignant()) &&
                c.getDateValidationEnseignant() != null
        ));
    }

    // ── APPROUVER ADMIN ───────────────────────────────────
    @Test
    @DisplayName("approuverAdmin — succes : statut passe a APPROUVEE_ADMIN")
    void approuverAdmin_success() {
        when(conventionRepository.findById(1L)).thenReturn(Optional.of(convention));
        when(conventionRepository.save(convention)).thenReturn(convention);
        when(conventionMapper.toResponse(convention)).thenReturn(
                ConventionResponse.builder().id(1L)
                        .statut(StatutConvention.APPROUVEE_ADMIN).build());

        ConventionResponse res = conventionService.approuverAdmin(1L, "Approuve");

        assertThat(res.getStatut()).isEqualTo(StatutConvention.APPROUVEE_ADMIN);

        verify(conventionRepository).save(argThat(c ->
                c.getStatut() == StatutConvention.APPROUVEE_ADMIN &&
                c.getDateApprouveAdmin() != null
        ));
    }

    // ── REJETER ───────────────────────────────────────────
    @Test
    @DisplayName("rejeter — succes : statut passe a REJETEE")
    void rejeter_success() {
        when(conventionRepository.findById(1L)).thenReturn(Optional.of(convention));
        when(conventionRepository.save(convention)).thenReturn(convention);
        when(conventionMapper.toResponse(convention)).thenReturn(
                ConventionResponse.builder().id(1L)
                        .statut(StatutConvention.REJETEE)
                        .commentaireAdmin("Dossier incomplet").build());

        ConventionResponse res = conventionService.rejeter(1L, "Dossier incomplet");

        assertThat(res.getStatut()).isEqualTo(StatutConvention.REJETEE);

        verify(conventionRepository).save(argThat(c ->
                c.getStatut() == StatutConvention.REJETEE &&
                "Dossier incomplet".equals(c.getCommentaireAdmin())
        ));
    }

    @Test
    @DisplayName("rejeter — echec : convention introuvable")
    void rejeter_notFound() {
        when(conventionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> conventionService.rejeter(99L, "commentaire"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}