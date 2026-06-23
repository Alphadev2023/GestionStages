package com.gestion.stages_backend.notification.application.service;

import com.gestion.stages_backend.identity.domain.model.User;
import com.gestion.stages_backend.identity.infrastructure.persistence.JpaUserRepository;
import com.gestion.stages_backend.notification.domain.model.Notification;
import com.gestion.stages_backend.notification.infrastructure.mail.JavaMailNotificationService;
import com.gestion.stages_backend.notification.infrastructure.persistence.JpaNotificationRepository;
import com.gestion.stages_backend.shared.infrastructure.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JpaNotificationRepository notificationRepository;
    private final JpaUserRepository userRepository;
    private final JavaMailNotificationService mailService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void notifier(Long destinataireId, String titre, String message,
                          String type, Long referenceId) {
        User destinataire = userRepository.findById(destinataireId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", destinataireId));

        Notification notification = Notification.builder()
                .destinataire(destinataire)
                .titre(titre)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .build();

        notificationRepository.save(notification);

        // Push WebSocket
        messagingTemplate.convertAndSendToUser(
                destinataire.getEmail(), "/queue/notifications", notification);

        // Email asynchrone
        mailService.sendEmail(destinataire.getEmail(), titre,
                "<h3>" + titre + "</h3><p>" + message + "</p>");
    }

    @Transactional(readOnly = true)
    public Page<Notification> mesNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByDestinataireIdOrderByCreatedAtDesc(userId, pageable);
    }

    @Transactional(readOnly = true)
    public long countNonLues(Long userId) {
        return notificationRepository.countByDestinataireIdAndLueFalse(userId);
    }
}