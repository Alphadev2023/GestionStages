package com.gestion.stages_backend.messagerie.application.service;

import com.gestion.stages_backend.identity.domain.model.User;
import com.gestion.stages_backend.identity.infrastructure.persistence.JpaUserRepository;
import com.gestion.stages_backend.messagerie.application.dto.MessageRequest;
import com.gestion.stages_backend.messagerie.application.dto.MessageResponse;
import com.gestion.stages_backend.messagerie.domain.model.Message;
import com.gestion.stages_backend.messagerie.infrastructure.persistence.JpaMessageRepository;
import com.gestion.stages_backend.shared.application.dto.PageResponse;
import com.gestion.stages_backend.shared.infrastructure.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MessagerieService {

    private final JpaMessageRepository messageRepository;
    private final JpaUserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public MessageResponse envoyer(MessageRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User expediteur = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Expéditeur introuvable"));
        User destinataire = userRepository.findById(request.getDestinataireId())
                .orElseThrow(() -> new ResourceNotFoundException("Destinataire", request.getDestinataireId()));

        Message message = Message.builder()
                .expediteur(expediteur)
                .destinataire(destinataire)
                .contenu(request.getContenu())
                .candidatureId(request.getCandidatureId())
                .build();

        MessageResponse response = toResponse(messageRepository.save(message));

        // Envoi WebSocket au destinataire
        messagingTemplate.convertAndSendToUser(
                destinataire.getEmail(), "/queue/messages", response);

        return response;
    }

    @Transactional(readOnly = true)
    public PageResponse<MessageResponse> getConversation(Long autreUserId, Pageable pageable) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User moi = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        return PageResponse.of(
                messageRepository.findConversation(moi.getId(), autreUserId, pageable)
                        .map(this::toResponse));
    }

    private MessageResponse toResponse(Message m) {
        return MessageResponse.builder()
                .id(m.getId())
                .expediteurId(m.getExpediteur().getId())
                .nomExpediteur(m.getExpediteur().getPrenom() + " " + m.getExpediteur().getNom())
                .destinataireId(m.getDestinataire().getId())
                .nomDestinataire(m.getDestinataire().getPrenom() + " " + m.getDestinataire().getNom())
                .contenu(m.getContenu())
                .lu(m.isLu())
                .candidatureId(m.getCandidatureId())
                .createdAt(m.getCreatedAt())
                .build();
    }
}