package org.example.repository;

import org.example.model.Dietitian;
import org.example.model.Note;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    Page<Note> findByDietitianIdAndClientId(Long dietitianId, Long clientId, Pageable pageable);
    List<Note> findAllByDietitianId(Long dietitianId);

}
