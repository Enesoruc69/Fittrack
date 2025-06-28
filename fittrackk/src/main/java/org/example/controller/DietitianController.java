package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dto.*;
import org.example.model.Dietitian;
import org.example.service.DietitianService;
import org.example.service.MessageService;
import org.example.service.NoteService;
import org.example.service.TrackingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/dietitians")
@RequiredArgsConstructor
public class DietitianController {
    private final TrackingService trackingService;
    private final DietitianService dietitianService;
    private final MessageService messageService;
    private final NoteService noteService;

    // Yalnızca ADMIN tarafından kullanılabilir: yeni diyetisyen ekleme
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/register")
    public ResponseEntity<Dietitian> registerDietitian(@RequestBody Dietitian dietitian) {
        return ResponseEntity.ok(dietitianService.registerDietitian(dietitian));
    }

    // Hem ADMIN hem CLIENT diyetisyenleri listeleyebilir
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENT')")
    @GetMapping
    public ResponseEntity<List<DietitianDto>> getAllDietitians() {
        return ResponseEntity.ok(dietitianService.getAllDietitians());
    }

    // Belirli ID ile diyetisyen getir (sadece ADMIN)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Dietitian> getDietitianById(@PathVariable Long id) {
        return ResponseEntity.ok(dietitianService.getDietitianById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDietitian(@PathVariable Long id) {
        dietitianService.deleteDietitian(id);
        return ResponseEntity.ok("Diyetisyen başarıyla silindi!");
    }

    @PreAuthorize("hasRole('DIETITIAN')")
    @GetMapping("/my-patients")
    public ResponseEntity<?> getMyAssignedClients(@RequestHeader("Authorization") String token) {
        String jwt = token.replace("Bearer ", "");
        return ResponseEntity.ok(dietitianService.getAssignedClients(jwt));
    }

    @PreAuthorize("hasRole('DIETITIAN')")
    @GetMapping("/my-diet-lists")
    public ResponseEntity<List<DietListResponse>> getMyDietLists(@RequestHeader("Authorization") String token) {
        String jwt = token.replace("Bearer ", "");
        return ResponseEntity.ok(dietitianService.getDietLists(jwt));
    }
    @PreAuthorize("hasRole('DIETITIAN')")
    @PostMapping("/dietitian/send")
    public ResponseEntity<?> sendMessageFromDietitian(@RequestBody MessageRequest request,
                                                      @RequestHeader("Authorization") String token) {
        messageService.sendMessageFromDietitian(token, request.getClientId(), request.getContent());
        return ResponseEntity.ok("Mesaj gönderildi");
    }

 @PreAuthorize("hasRole('DIETITIAN')")
@GetMapping("/profile")
public ResponseEntity<UpdateDietitianRequest> getDietitianProfile(
        @RequestHeader("Authorization") String token) {

    Optional<Dietitian> optionalDietitian = dietitianService.findByToken(token);

    if (optionalDietitian.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    Dietitian dietitian = optionalDietitian.get();

    UpdateDietitianRequest dto = new UpdateDietitianRequest();
    dto.setFirstName(dietitian.getFirstName());
    dto.setLastName(dietitian.getLastName());
    dto.setEmail(dietitian.getEmail());
    dto.setPassword(""); // Şifre güvenlik için boş gönderiliyor

    return ResponseEntity.ok(dto);
}


@PreAuthorize("hasRole('DIETITIAN')")
@PutMapping("/profile/update")
public ResponseEntity<String> updateDietitianProfile(
        @RequestHeader("Authorization") String token,
        @RequestBody UpdateDietitianRequest updateRequest) {

    dietitianService.updateDietitianProfile(token, updateRequest);
    return ResponseEntity.ok("Profil bilgileri başarıyla güncellendi.");
}

    @PreAuthorize("hasRole('DIETITIAN')")
    @PostMapping("/notes")
    public ResponseEntity<String> addNote(
            @RequestHeader("Authorization") String token,
            @RequestBody NoteRequest request) {
        noteService.addNote(token, request);
        return ResponseEntity.ok("Not eklendi.");
    }

    @PreAuthorize("hasRole('DIETITIAN')")
    @GetMapping("/notes/{clientId}")
    public ResponseEntity<Page<NoteResponse>> getNotes(
            @RequestHeader("Authorization") String token,
            @PathVariable Long clientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(noteService.getNotes(token, clientId, pageable));
    }


}
