package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.dto.DietitianRequestDto;
import org.example.model.Client;
import org.example.model.DietitianRequest;
import org.example.repository.DietitianRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DietitianRequestService {

    private final DietitianRequestRepository dietitianRequestRepository;

    // Yeni bir diyetisyen olma isteği oluşturur
    public DietitianRequest createRequest(Client client, String motivation, String documentPath) {
        DietitianRequest request = DietitianRequest.builder()
                .client(client)
                .motivationText(motivation)
                .documentPath(documentPath)
                .status("PENDING")
                .requestDate(LocalDateTime.now())
                .build();
        return dietitianRequestRepository.save(request);
    }

    // Durumu PENDING olan tüm istekleri getirir
    public List<DietitianRequest> getPendingRequests() {
        return dietitianRequestRepository.findByStatus("PENDING");
    }

    // ID ile isteği getirir (opsiyonel)
    public Optional<DietitianRequest> getRequestById(Long id) {
        return dietitianRequestRepository.findById(id);
    }

    // Bir client'a ait istekleri DTO listesi olarak getirir
    public List<DietitianRequestDto> getRequestsByClient(Client client) {
    List<DietitianRequest> requests = dietitianRequestRepository.findByClient(client);

    return requests.stream()
            .map(request -> {
                DietitianRequestDto dto = new DietitianRequestDto();
                dto.setId(request.getId());
                dto.setClientId(request.getClient().getId());
                
                // Eğer getFullName yoksa veya hata veriyorsa, isimleri elle birleştir
                dto.setClientFullName(request.getClient().getFirstName() + " " + request.getClient().getLastName());
                
                dto.setMotivationText(request.getMotivationText());
                dto.setDocumentPath(request.getDocumentPath());
                dto.setStatus(request.getStatus());
                dto.setRequestDate(request.getRequestDate());
                
                return dto;
            })
            .collect(Collectors.toList());
}


    // İsteği onaylar (durumunu APPROVED yapar)
    public void approveRequest(DietitianRequest request) {
        request.setStatus("APPROVED");
        dietitianRequestRepository.save(request);
    }

    // İsteği reddeder (durumunu REJECTED yapar)
    public void rejectRequest(DietitianRequest request) {
        request.setStatus("REJECTED");
        dietitianRequestRepository.save(request);
    }

    // Bir client'ın bekleyen (PENDING) isteği var mı kontrol eder
    public boolean clientHasPendingRequest(Client client) {
        return dietitianRequestRepository.existsByClientAndStatus(client, "PENDING");
    }

    // Client ID ile isteğin varlığını kontrol eder
    public boolean existsByClientId(Long clientId) {
        return dietitianRequestRepository.existsByClient_Id(clientId);
    }

    public void deleteRequestsByClient(Client client) {
    List<DietitianRequest> requests = dietitianRequestRepository.findByClient(client);
    if (!requests.isEmpty()) {
        dietitianRequestRepository.deleteAll(requests);
    }
}

public void save(DietitianRequest request) {
    dietitianRequestRepository.save(request);
}


}
