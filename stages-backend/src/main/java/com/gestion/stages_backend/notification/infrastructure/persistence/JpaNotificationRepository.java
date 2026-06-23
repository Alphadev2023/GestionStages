package com.gestion.stages_backend.notification.infrastructure.persistence;

import com.gestion.stages_backend.notification.domain.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaNotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByDestinataireIdOrderByCreatedAtDesc(Long destinataireId, Pageable pageable);
    long countByDestinataireIdAndLueFalse(Long destinataireId);
}