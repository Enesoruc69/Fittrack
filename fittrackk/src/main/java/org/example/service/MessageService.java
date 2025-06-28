package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.model.Client;
import org.example.model.Dietitian;
import org.example.model.Message;
import org.example.repository.ClientRepository;
import org.example.repository.DietitianRepository;
import org.example.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ClientService clientService;
    private final DietitianService dietitianService;
    private final ClientRepository clientRepository;
    private final DietitianRepository dietitianRepository;
    private final JwtService jwtService;

    public void sendMessageFromClient(String token, String content) {
        Client sender = clientService.getClientByToken(token);
        Dietitian receiver = sender.getDietitian();

        if (receiver == null)
            throw new IllegalStateException("Diyetisyen atanmadı!");

        Message msg = Message.builder()
                .senderClient(sender)
                .receiverDietitian(receiver)
                .content(content)
                .fromClient(true)
                .timestamp(LocalDateTime.now())
                .build();

        messageRepository.save(msg);
    }

    public void sendMessageFromDietitian(String token, Long clientId, String content) {
        String email = jwtService.extractUsername(token.replace("Bearer ", ""));
        Dietitian sender = dietitianRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Diyetisyen bulunamadı."));
        Client receiver = clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Danışan bulunamadı."));

        if (receiver.getDietitian() == null || !receiver.getDietitian().getId().equals(sender.getId())) {
            throw new SecurityException("Bu danışana mesaj gönderemezsiniz.");
        }

        Message msg = Message.builder()
                .senderDietitian(sender)
                .receiverClient(receiver)
                .content(content)
                .fromClient(false)
                .timestamp(LocalDateTime.now())
                .build();

        messageRepository.save(msg);
    }

    public List<Message> getMessagesWithDietitian(String token) {
        Client client = clientService.getClientByToken(token);
        Dietitian dietitian = client.getDietitian();

        if (dietitian == null) {
            throw new IllegalStateException("Diyetisyen atanmamış.");
        }

        return messageRepository.findMessagesBetweenClientAndDietitian(client, dietitian);
    }

    public List<Message> getMessagesWithClient(String token, Long clientId) {
        Dietitian dietitian = dietitianService.getDietitianByToken(token.replace("Bearer ", ""));
        Client client = clientService.getClientById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Danışan bulunamadı."));

        if (client.getDietitian() == null || !client.getDietitian().getId().equals(dietitian.getId())) {
            throw new SecurityException("Bu danışana ait mesajlara erişim yetkiniz yok.");
        }

        return messageRepository.findMessagesBetweenClientAndDietitian(client, dietitian);
    }
}
