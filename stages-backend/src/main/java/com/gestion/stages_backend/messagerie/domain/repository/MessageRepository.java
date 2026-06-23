package com.gestion.stages_backend.messagerie.domain.repository;

import com.gestion.stages_backend.messagerie.domain.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MessageRepository {
    Page<Message> findConversation(Long user1Id, Long user2Id, Pageable pageable);
    long countByDestinatairIdAndLuFalse(Long destinataireId);
}
