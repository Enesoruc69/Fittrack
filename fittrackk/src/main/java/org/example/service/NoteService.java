package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.dto.NoteRequest;
import org.example.dto.NoteResponse;
import org.example.model.Note;
import org.example.model.Dietitian;
import org.example.repository.NoteRepository;
import org.example.repository.DietitianRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NoteService {
    private final NoteRepository noteRepository;
    private final JwtService jwtService;
    private final DietitianRepository dietitianRepository;

    public void addNote(String token, NoteRequest request) {
        String email = jwtService.extractUsername(token.replace("Bearer ", ""));
        Long dietitianId = dietitianRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Diyetisyen bulunamadı"))
                .getId();

        Note note = new Note();
        note.setClientId(request.getClientId());
        note.setDietitianId(dietitianId);
        note.setContent(request.getContent());
        note.setCreatedAt(LocalDateTime.now());
        noteRepository.save(note);
    }

    public Page<NoteResponse> getNotes(String token, Long clientId, Pageable pageable) {
        String email = jwtService.extractUsername(token.replace("Bearer ", ""));
        Long dietitianId = dietitianRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Diyetisyen bulunamadı"))
                .getId();

        return noteRepository.findByDietitianIdAndClientId(dietitianId, clientId, pageable)
                .map(note -> {
                    NoteResponse response = new NoteResponse();
                    response.setContent(note.getContent());
                    response.setCreatedAt(note.getCreatedAt());
                    return response;
                });
    }
}
