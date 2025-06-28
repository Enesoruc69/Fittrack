package org.example.dto;

import lombok.Data;

import java.time.LocalDateTime;
@Data

public class NoteResponse {
    private String content;
    private LocalDateTime createdAt;
}