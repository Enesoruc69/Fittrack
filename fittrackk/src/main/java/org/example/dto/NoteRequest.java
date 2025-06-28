package org.example.dto;

import lombok.Data;

@Data

public class NoteRequest {
    private Long clientId;
    private String content;
}