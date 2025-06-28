package org.example.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.example.model.Message;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class MessageResponse {
    private String senderName;
    private String content;
    private LocalDateTime timestamp;

    public static MessageResponse fromEntity(Message message) {
        String senderName = message.isFromClient() ?
                message.getSenderClient().getFirstName() :
                message.getSenderDietitian().getFirstName();

        return new MessageResponse(senderName, message.getContent(), message.getTimestamp());
    }
}
