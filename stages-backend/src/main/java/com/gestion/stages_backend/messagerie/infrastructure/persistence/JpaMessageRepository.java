package com.gestion.stages_backend.messagerie.infrastructure.persistence;

import com.gestion.stages_backend.messagerie.domain.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaMessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m " +
           "WHERE (m.expediteur.id = :u1 AND m.destinataire.id = :u2) " +
           "OR (m.expediteur.id = :u2 AND m.destinataire.id = :u1) " +
           "ORDER BY m.createdAt ASC")
    Page<Message> findConversation(@Param("u1") Long user1Id,
                                   @Param("u2") Long user2Id,
                                   Pageable pageable);

    long countByDestinataireIdAndLuFalse(Long destinataireId);
}
