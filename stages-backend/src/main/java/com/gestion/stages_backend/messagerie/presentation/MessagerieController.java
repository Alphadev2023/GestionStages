package com.gestion.stages_backend.messagerie.presentation;

import com.gestion.stages_backend.messagerie.application.dto.MessageRequest;
import com.gestion.stages_backend.messagerie.application.dto.MessageResponse;
import com.gestion.stages_backend.messagerie.application.service.MessagerieService;
import com.gestion.stages_backend.shared.application.dto.ApiResponse;
import com.gestion.stages_backend.shared.application.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Tag(name = "Messagerie", description = "Messagerie instantanée étudiant-entreprise")
public class MessagerieController {

    private final MessagerieService messagerieService;

    @PostMapping
    @Operation(summary = "Envoyer un message (REST)")
    public ResponseEntity<ApiResponse<MessageResponse>> envoyer(
            @Valid @RequestBody MessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(messagerieService.envoyer(request)));
    }

    @GetMapping("/conversation/{autreUserId}")
    @Operation(summary = "Historique d''une conversation")
    public ResponseEntity<ApiResponse<PageResponse<MessageResponse>>> conversation(
            @PathVariable Long autreUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                messagerieService.getConversation(autreUserId, PageRequest.of(page, size))));
    }

    // Endpoint WebSocket STOMP
    @MessageMapping("/messages.envoyer")
    public void envoyerWs(@Payload MessageRequest request) {
        messagerieService.envoyer(request);
    }
}