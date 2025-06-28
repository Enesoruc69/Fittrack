package org.example.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_client_id")
    private Client senderClient;

    @ManyToOne
    @JoinColumn(name = "receiver_dietitian_id")
    private Dietitian receiverDietitian;

    @ManyToOne
    @JoinColumn(name = "sender_dietitian_id")
    private Dietitian senderDietitian;

    @ManyToOne
    @JoinColumn(name = "receiver_client_id")
    private Client receiverClient;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private boolean fromClient;
}
