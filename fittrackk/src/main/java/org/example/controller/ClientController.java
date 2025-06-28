package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dto.*;
import org.example.model.Client;
import org.example.service.ClientService;
import org.example.service.DietitianRequestService;
import org.example.service.HealthInfoService;
import org.example.service.DietListService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/clients")
@PreAuthorize("hasRole('CLIENT')")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;
    private final HealthInfoService healthInfoService;
    private final DietListService dietListService;
    private final DietitianRequestService dietitianRequestService;

    // Kendi bilgilerini getir
    @GetMapping("/me")
    public ResponseEntity<ClientSelfDto> getOwnClientInfo(@RequestHeader("Authorization") String token) {
        String email = clientService.extractEmailFromToken(token.replace("Bearer ", ""));
        ClientSelfDto dto = clientService.getSelfInfo(email);
        return ResponseEntity.ok(dto);
    }

    // Sağlık bilgisi oluştur veya güncelle
    @PostMapping("/health-info")
    public ResponseEntity<String> createOrUpdateHealthInfo(@RequestHeader("Authorization") String token,
                                                           @RequestBody HealthInfoRequest request) {
        healthInfoService.saveOrUpdateHealthInfo(token.replace("Bearer ", ""), request);
        return ResponseEntity.ok("Sağlık bilgisi kaydedildi veya güncellendi.");
    }

    // Sağlık bilgisi görüntüleme
    @GetMapping("/health-info")
    public ResponseEntity<?> getHealthInfo(@RequestHeader("Authorization") String token) {
        HealthInfoRequest dto = healthInfoService.getHealthInfoByToken(token.replace("Bearer ", ""));
        if (dto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Kayıtlı sağlık bilgisi bulunamadı.");
        }
        return ResponseEntity.ok(dto);
    }

    // Diyet tipi seçme
    @PostMapping("/select-diet")
    public ResponseEntity<String> selectDietType(@RequestHeader("Authorization") String token,
                                                 @RequestBody DietSelectionRequest request) {
        clientService.assignDietType(token.replace("Bearer ", ""), request.getDietTypeId());
        return ResponseEntity.ok("Diyet tipi başarıyla seçildi.");
    }

    // Diyetisyen seçme
    @PostMapping("/select-dietitian")
    public ResponseEntity<String> selectDietitian(@RequestHeader("Authorization") String token,
                                                  @RequestBody DietitianSelectionRequest request) {
        clientService.assignDietitian(token.replace("Bearer ", ""), request.getDietitianId());
        return ResponseEntity.ok("Diyetisyen başarıyla atandı.");
    }

    // Diyet listesi görüntüleme (hasta)
    @GetMapping("/diet-list")
    public ResponseEntity<DietListResponse> getClientDietList(@RequestHeader("Authorization") String token) {
        DietListResponse list = dietListService.getClientDietList(token.replace("Bearer ", ""));
        return ResponseEntity.ok(list);
    }

    // Diyetisyen olma başvurusu gönderme
    @PostMapping("/dietitian-request")
    public ResponseEntity<String> sendDietitianRequest(@RequestHeader("Authorization") String token,
                                                       @RequestParam("motivation") String motivation,
                                                       @RequestParam("document") MultipartFile document) {
        try {
            String email = clientService.extractEmailFromToken(token.replace("Bearer ", ""));
            Client client = clientService.getClientByEmail(email);

            // Bekleyen başvuru kontrolü
            boolean alreadyPending = dietitianRequestService.clientHasPendingRequest(client);
            if (alreadyPending) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Zaten bekleyen bir diyetisyen olma başvurunuz var.");
            }

            // Belgeyi kaydet
            String uploadsDir = "uploads/";
            File dir = new File(uploadsDir);
            if (!dir.exists()) dir.mkdirs();

            String filename = client.getId() + "_" + System.currentTimeMillis() + "_" + document.getOriginalFilename();
            Path filePath = Paths.get(uploadsDir + filename);
            Files.write(filePath, document.getBytes());

            dietitianRequestService.createRequest(client, motivation, filePath.toString());

            return ResponseEntity.ok("Diyetisyen olma isteği başarıyla gönderildi.");

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Belge yüklenirken hata oluştu.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("İstek gönderilemedi: " + e.getMessage());
        }
    }

    // Başvuru yapılıp yapılmadığını kontrol etme
    @GetMapping("/dietitian-request/check")
    public ResponseEntity<Boolean> checkIfAlreadyApplied(@RequestHeader("Authorization") String token) {
        String email = clientService.extractEmailFromToken(token.replace("Bearer ", ""));
        Client client = clientService.getClientByEmail(email);
        if (client == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
        boolean exists = dietitianRequestService.existsByClientId(client.getId());
        return ResponseEntity.ok(exists);
    }

    // Mevcut başvurunun detaylarını getir
    @GetMapping("/dietitian-request/details")
    public ResponseEntity<?> getDietitianRequestDetails(@RequestHeader("Authorization") String token) {
        String email = clientService.extractEmailFromToken(token.replace("Bearer ", ""));
        Client client = clientService.getClientByEmail(email);
        if (client == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Geçerli kullanıcı bulunamadı.");
        }

        List<DietitianRequestDto> requests = dietitianRequestService.getRequestsByClient(client);
        if (requests.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Başvuru bulunamadı.");
        }

        // En güncel başvuruyu döndür
        DietitianRequestDto latestRequest = requests.get(requests.size() - 1);
        return ResponseEntity.ok(latestRequest);
    }

    // Profil bilgilerini getirme
    @GetMapping("/profile")
    public ResponseEntity<ClientSelfDto> getProfile(@RequestHeader("Authorization") String token) {
        String email = clientService.extractEmailFromToken(token.replace("Bearer ", ""));
        ClientSelfDto clientProfile = clientService.getSelfInfo(email);
        return ResponseEntity.ok(clientProfile);
    }

    // Profil güncelleme
    @PutMapping("/profile/update")
public ResponseEntity<ClientSelfDto> updateProfile(@RequestHeader("Authorization") String token,
                                                   @RequestBody UpdateClientRequest request) {
    String email = clientService.extractEmailFromToken(token.replace("Bearer ", ""));
    Client client = clientService.getClientByEmail(email);
    if (client == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
    Client updatedClient = clientService.updateClientProfile(client.getId(), request);

    // DTO dönüşümünde builder kullanıyoruz
    ClientSelfDto updatedDto = ClientSelfDto.builder()
            .id(updatedClient.getId())
            .email(updatedClient.getEmail())
            .firstName(updatedClient.getFirstName())
            .lastName(updatedClient.getLastName())
            .age(updatedClient.getAge())  // client modelinde varsa getter ile al
            .gender(updatedClient.getGender()) // varsa
            .build();

    return ResponseEntity.ok(updatedDto);
}

}
