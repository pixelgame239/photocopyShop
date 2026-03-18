package com.photocopy.backend.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.photocopy.backend.entity.BoxChat;

@Repository
public interface BoxChatRepository extends JpaRepository<BoxChat, Long> {
    Optional<BoxChat> findByParticipant(String participant);
    List<BoxChat> findAllByOrderByLastUpdatedDesc();
    boolean existsByParticipantAndId(String participant, Long id);
    boolean existsByParticipantAndUserReadFalse(String participant);
    void deleteByMessageTypeEquals(String messageType);
}
