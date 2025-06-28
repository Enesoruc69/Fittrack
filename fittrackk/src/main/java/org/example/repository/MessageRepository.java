package org.example.repository;

import org.example.model.Client;
import org.example.model.Dietitian;
import org.example.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("""
           SELECT m FROM Message m
           WHERE (m.senderClient = :client AND m.receiverDietitian = :dietitian)
              OR (m.senderDietitian = :dietitian AND m.receiverClient = :client)
           ORDER BY m.timestamp ASC
           """)
    List<Message> findMessagesBetweenClientAndDietitian(
            @Param("client") Client client,
            @Param("dietitian") Dietitian dietitian
    );
    void deleteBySenderClient(Client client);
    void deleteByReceiverClient(Client client);

}
