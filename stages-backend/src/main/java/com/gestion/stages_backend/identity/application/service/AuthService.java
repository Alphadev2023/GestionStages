package com.gestion.stages_backend.identity.application.service;

import com.gestion.stages_backend.identity.application.dto.AuthResponse;
import com.gestion.stages_backend.identity.application.dto.LoginRequest;
import com.gestion.stages_backend.identity.application.dto.RegisterRequest;
import com.gestion.stages_backend.identity.domain.model.User;
import com.gestion.stages_backend.identity.infrastructure.persistence.JpaUserRepository;
import com.gestion.stages_backend.identity.infrastructure.security.JwtService;
import com.gestion.stages_backend.shared.infrastructure.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JpaUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Un compte avec cet email existe deja");
        }
        User user = User.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .telephone(request.getTelephone())
                .role(request.getRole())
                .filiere(request.getFiliere())
                .promotion(request.getPromotion())
                .nomEntreprise(request.getNomEntreprise())
                .secteurActivite(request.getSecteurActivite())
                .departement(request.getDepartement())
                .build();
        userRepository.save(user);
        UserDetails ud = userDetailsService.loadUserByUsername(user.getEmail());
        return buildResponse(user, jwtService.generateToken(ud));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getMotDePasse()));
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Utilisateur introuvable"));
        UserDetails ud = userDetailsService.loadUserByUsername(user.getEmail());
        return buildResponse(user, jwtService.generateToken(ud));
    }

    private AuthResponse buildResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .role(user.getRole())
                .userId(user.getId())
                .nomEntreprise(user.getNomEntreprise())
                .secteurActivite(user.getSecteurActivite())
                .filiere(user.getFiliere())
                .promotion(user.getPromotion())
                .departement(user.getDepartement())
                .build();
    }
}
