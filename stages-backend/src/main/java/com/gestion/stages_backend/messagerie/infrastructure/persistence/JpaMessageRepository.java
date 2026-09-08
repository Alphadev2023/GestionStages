package com.gestion.stages_backend.messagerie.infrastructure.persistence;

import com.gestion.stages_backend.messagerie.domain.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

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

    @Query("SELECT m.expediteur.id, COUNT(m) FROM Message m " +
            "WHERE m.destinataire.id = :destinataireId AND m.lu = false " +
            "GROUP BY m.expediteur.id")
    List<Object[]> countNonLusParExpediteur(@Param("destinataireId") Long destinataireId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Message m SET m.lu = true " +
            "WHERE m.destinataire.id = :moiId AND m.expediteur.id = :autreId AND m.lu = false")
    int marquerCommeLus(@Param("moiId") Long moiId, @Param("autreId") Long autreId);
}