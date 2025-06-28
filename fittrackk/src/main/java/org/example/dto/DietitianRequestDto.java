package org.example.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DietitianRequestDto {
    private Long id;
    private Long clientId;
    private String clientFullName;
    private String motivationText;
    private String documentPath;
    private String status;
    private LocalDateTime requestDate;
}
