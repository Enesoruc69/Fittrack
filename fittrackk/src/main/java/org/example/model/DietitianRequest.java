package org.example.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "dietitian_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DietitianRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Başvuran kullanıcı
    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String motivationText;

    @Column(nullable = false)
    private String documentPath;

    @Column(nullable = false)
    private String status; // "PENDING", "APPROVED", "REJECTED"

    @Column(nullable = false)
    private LocalDateTime requestDate;
}
