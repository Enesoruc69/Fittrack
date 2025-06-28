package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dto.MessageRequest;
import org.example.dto.MessageResponse;
import org.example.model.Message;
import org.example.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping("/send")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<String> sendMessageFromClient(
            @RequestHeader("Authorization") String token,
            @RequestBody MessageRequest request) {
        try {
            messageService.sendMessageFromClient(token.replace("Bearer ", ""), request.getContent());
            return ResponseEntity.ok("Mesaj gönderildi.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Hata: " + e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<MessageResponse>> getMessagesForClient(
            @RequestHeader("Authorization") String token) {
        try {
            List<Message> messages = messageService.getMessagesWithDietitian(token.replace("Bearer ", ""));
            List<MessageResponse> response = messages.stream()
                    .map(MessageResponse::fromEntity)
                    .toList();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/dietitian/send")
    @PreAuthorize("hasRole('DIETITIAN')")
    public ResponseEntity<String> sendMessageFromDietitian(
            @RequestHeader("Authorization") String token,
            @RequestBody MessageRequest request) {
        try {
            messageService.sendMessageFromDietitian(token.replace("Bearer ", ""), request.getClientId(), request.getContent());
            return ResponseEntity.ok("Diyetisyen mesajı gönderildi.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Hata: " + e.getMessage());
        }
    }

    @GetMapping("/dietitian/{clientId}")
    @PreAuthorize("hasRole('DIETITIAN')")
    public ResponseEntity<List<MessageResponse>> getMessagesWithClient(
            @PathVariable Long clientId,
            @RequestHeader("Authorization") String token) {
        try {
            List<Message> messages = messageService.getMessagesWithClient(token.replace("Bearer ", ""), clientId);
            List<MessageResponse> response = messages.stream()
                    .map(MessageResponse::fromEntity)
                    .toList();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
