package com.gestion.stages_backend.identity.presentation;

import com.gestion.stages_backend.identity.application.dto.AuthResponse;
import com.gestion.stages_backend.identity.application.dto.LoginRequest;
import com.gestion.stages_backend.identity.application.dto.RegisterRequest;
import com.gestion.stages_backend.identity.application.service.AuthService;
import com.gestion.stages_backend.shared.application.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "Inscription et connexion")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Inscription d''un nouvel utilisateur")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Compte créé avec succès", authService.register(request)));
    }

    @PostMapping("/login")
    @Operation(summary = "Connexion utilisateur")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.login(request)));
    }
}