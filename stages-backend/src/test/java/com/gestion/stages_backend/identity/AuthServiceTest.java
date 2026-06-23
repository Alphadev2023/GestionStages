package com.gestion.stages_backend.identity;

import com.gestion.stages_backend.identity.application.dto.AuthResponse;
import com.gestion.stages_backend.identity.application.dto.LoginRequest;
import com.gestion.stages_backend.identity.application.dto.RegisterRequest;
import com.gestion.stages_backend.identity.application.service.AuthService;
import com.gestion.stages_backend.identity.domain.model.Role;
import com.gestion.stages_backend.identity.domain.model.User;
import com.gestion.stages_backend.identity.infrastructure.persistence.JpaUserRepository;
import com.gestion.stages_backend.identity.infrastructure.security.JwtService;
import com.gestion.stages_backend.shared.infrastructure.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService — Tests unitaires")
class AuthServiceTest {

    @Mock JpaUserRepository    userRepository;
    @Mock PasswordEncoder      passwordEncoder;
    @Mock JwtService           jwtService;
    @Mock AuthenticationManager authenticationManager;
    @Mock UserDetailsService   userDetailsService;

    @InjectMocks AuthService authService;

    private User user;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L).nom("Diallo").prenom("Mamadou")
                .email("etudiant@uni.com").motDePasse("hashed")
                .role(Role.ETUDIANT).filiere("Informatique").promotion("2026")
                .build();

        userDetails = org.springframework.security.core.userdetails.User.builder()
                .username("etudiant@uni.com").password("hashed")
                .authorities("ROLE_ETUDIANT").build();
    }

    // ── REGISTER ──────────────────────────────────────────
    @Test
    @DisplayName("register — succes : retourne token et infos utilisateur")
    void register_success() {
        RegisterRequest req = new RegisterRequest();
        req.setNom("Diallo"); req.setPrenom("Mamadou");
        req.setEmail("etudiant@uni.com"); req.setMotDePasse("Password1!");
        req.setRole(Role.ETUDIANT); req.setFiliere("Informatique"); req.setPromotion("2026");

        when(userRepository.existsByEmail("etudiant@uni.com")).thenReturn(false);
        when(passwordEncoder.encode("Password1!")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userDetailsService.loadUserByUsername("etudiant@uni.com")).thenReturn(userDetails);
        when(jwtService.generateToken(userDetails)).thenReturn("jwt-token");

        AuthResponse res = authService.register(req);

        assertThat(res.getToken()).isEqualTo("jwt-token");
        assertThat(res.getEmail()).isEqualTo("etudiant@uni.com");
        assertThat(res.getRole()).isEqualTo(Role.ETUDIANT);
        assertThat(res.getNom()).isEqualTo("Diallo");

        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode("Password1!");
    }

    @Test
    @DisplayName("register — echec : email deja utilise")
    void register_emailDejaUtilise() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("etudiant@uni.com"); req.setRole(Role.ETUDIANT);

        when(userRepository.existsByEmail("etudiant@uni.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("email");

        verify(userRepository, never()).save(any());
    }

    // ── LOGIN ─────────────────────────────────────────────
    @Test
    @DisplayName("login — succes : retourne token valide")
    void login_success() {
        LoginRequest req = new LoginRequest();
        req.setEmail("etudiant@uni.com"); req.setMotDePasse("Password1!");

        when(userRepository.findByEmail("etudiant@uni.com")).thenReturn(Optional.of(user));
        when(userDetailsService.loadUserByUsername("etudiant@uni.com")).thenReturn(userDetails);
        when(jwtService.generateToken(userDetails)).thenReturn("jwt-token");

        AuthResponse res = authService.login(req);

        assertThat(res.getToken()).isEqualTo("jwt-token");
        assertThat(res.getEmail()).isEqualTo("etudiant@uni.com");
        assertThat(res.getRole()).isEqualTo(Role.ETUDIANT);

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("login — echec : utilisateur introuvable apres auth")
    void login_userNotFound() {
        LoginRequest req = new LoginRequest();
        req.setEmail("inconnu@uni.com"); req.setMotDePasse("pass");

        when(userRepository.findByEmail("inconnu@uni.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("register — les champs specifiques au role sont sauvegardes")
    void register_roleSpecificFieldsSaved() {
        RegisterRequest req = new RegisterRequest();
        req.setNom("Corp"); req.setPrenom("Tech");
        req.setEmail("rh@corp.com"); req.setMotDePasse("pass");
        req.setRole(Role.ENTREPRISE);
        req.setNomEntreprise("TechCorp"); req.setSecteurActivite("INFORMATIQUE");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);
        when(jwtService.generateToken(any())).thenReturn("token");

        User savedUser = User.builder().id(2L).nom("Corp").prenom("Tech")
                .email("rh@corp.com").motDePasse("hashed")
                .role(Role.ENTREPRISE).nomEntreprise("TechCorp").build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        AuthResponse res = authService.register(req);

        assertThat(res.getNomEntreprise()).isEqualTo("TechCorp");

        verify(userRepository).save(argThat(u ->
                "TechCorp".equals(u.getNomEntreprise()) &&
                "INFORMATIQUE".equals(u.getSecteurActivite())
        ));
    }
}