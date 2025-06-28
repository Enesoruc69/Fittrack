package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dto.AdminUserCreationRequest;
import org.example.dto.ClientAdminDto;
import org.example.dto.DietitianDto;
import org.example.dto.DietitianRequestDto;
import org.example.dto.UpdateAdminRequest;
import org.example.model.Admin;
import org.example.model.Client;
import org.example.model.DietitianRequest;
import org.example.repository.ClientRepository;
import org.example.service.AdminService;
import org.example.service.ClientService;
import org.example.service.DietitianRequestService;
import org.example.service.DietitianService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final ClientService clientService;
    private final DietitianService dietitianService;
    private final AdminService adminService;
    private final ClientRepository clientRepository;
    private final DietitianRequestService dietitianRequestService;

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        Map<String, Object> allUsers = new HashMap<>();
        allUsers.put("clients", adminService.getAllClientsAsDto());
        allUsers.put("dietitians", dietitianService.getAllDietitians());
        allUsers.put("admins", adminService.getAllAdmins());
        return ResponseEntity.ok(allUsers);
    }

    @DeleteMapping("/delete/client/{id}")
    public ResponseEntity<String> deleteClient(@PathVariable("id") Long id) {
        adminService.deleteClientById(id);
        return ResponseEntity.ok("Client başarıyla silindi.");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/dietitian/{dietitianId}/patients")
    public ResponseEntity<?> getPatientsOfDietitian(@PathVariable Long dietitianId) {
        return ResponseEntity.ok(dietitianService.getPatientsByDietitianId(dietitianId));
    }

      @DeleteMapping("/delete/dietitian/{id}")
    public ResponseEntity<String> deleteDietitian(@PathVariable("id") Long id) {
        adminService.deleteDietitianById(id);
        return ResponseEntity.ok("Diyetisyen başarıyla silindi.");
    }

    @PostMapping("/convert-to-dietitian/{clientId}")
    public ResponseEntity<DietitianDto> convertToDietitian(@PathVariable("clientId") Long clientId) {
        return ResponseEntity.ok(adminService.promoteClientToDietitian(clientId));
    }

    @PostMapping("/create-user")
    public ResponseEntity<String> createUser(@RequestBody AdminUserCreationRequest request) {
        adminService.createUserAsAdmin(request);
        return ResponseEntity.ok("Kullanıcı başarıyla eklendi.");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/monthly-client-count")
    public ResponseEntity<Map<String, Integer>> getMonthlyClientCount() {
        List<Client> clients = clientRepository.findAll();
        Map<String, Integer> monthCount = new LinkedHashMap<>();

        List<String> months = List.of("Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran");
        for (String month : months) {
            monthCount.put(month, 0);
        }

        for (Client client : clients) {
            LocalDateTime createdAt = client.getCreatedAt();
            String monthName = createdAt.getMonth().getDisplayName(TextStyle.FULL, new Locale("tr")).toLowerCase();

            months.forEach(m -> {
                if (monthName.contains(m.toLowerCase())) {
                    monthCount.put(m, monthCount.get(m) + 1);
                }
            });
        }

        return ResponseEntity.ok(monthCount);
    }

    

    // 1. Diyetisyen olma isteklerini listele (DTO ile)
    @GetMapping("/dietitian-requests")
    public ResponseEntity<List<DietitianRequestDto>> getAllPendingRequests() {
        List<DietitianRequest> pendingRequests = dietitianRequestService.getPendingRequests();

        List<DietitianRequestDto> dtoList = pendingRequests.stream()
                .map(request -> DietitianRequestDto.builder()
                        .id(request.getId())
                        .clientId(request.getClient().getId())
                        .clientFullName(request.getClient().getFirstName() + " " + request.getClient().getLastName())
                        .motivationText(request.getMotivationText())
                        .documentPath(request.getDocumentPath())
                        .status(request.getStatus())
                        .requestDate(request.getRequestDate())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }

    // 2. Belge indirme
    @GetMapping("/dietitian-requests/download/{id}")
    public ResponseEntity<Resource> downloadRequestDocument(@PathVariable Long id) {
        Optional<DietitianRequest> optionalRequest = dietitianRequestService.getRequestById(id);

        if (optionalRequest.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String documentPath = optionalRequest.get().getDocumentPath();
        File file = new File(documentPath);

        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + file.getName());

        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(file.length())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    // 3. Başvuru onaylama
    @PostMapping("/dietitian-requests/{id}/approve")
public ResponseEntity<String> approveRequest(@PathVariable Long id) {
    Optional<DietitianRequest> optionalRequest = dietitianRequestService.getRequestById(id);

    if (optionalRequest.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    DietitianRequest request = optionalRequest.get();

    // 1. Başvuru durumunu güncelle
    request.setStatus("APPROVED");
    dietitianRequestService.save(request); // request'in güncellenmiş halini kaydet

    // 2. Kullanıcıyı diyetisyen yap
    DietitianDto newDietitian = adminService.promoteClientToDietitian(request.getClient().getId());

    return ResponseEntity.ok("Başvuru onaylandı. " + newDietitian.getFirstName() + " artık bir diyetisyen.");
}


    // 4. Başvuru reddetme
    @PostMapping("/dietitian-requests/{id}/reject")
    public ResponseEntity<String> rejectRequest(@PathVariable Long id) {
        Optional<DietitianRequest> optionalRequest = dietitianRequestService.getRequestById(id);

        if (optionalRequest.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        DietitianRequest request = optionalRequest.get();
        dietitianRequestService.rejectRequest(request);

        return ResponseEntity.ok("Başvuru reddedildi.");
    }

@GetMapping("/profile")
public ResponseEntity<UpdateAdminRequest> getAdminProfile(@AuthenticationPrincipal UserDetails userDetails) {
    Optional<Admin> optionalAdmin = adminService.findByEmail(userDetails.getUsername());

    if (optionalAdmin.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    Admin admin = optionalAdmin.get();

    UpdateAdminRequest dto = new UpdateAdminRequest();
    dto.setFirstName(admin.getFirstName());
    dto.setLastName(admin.getLastName());
    dto.setEmail(admin.getEmail());
    dto.setPassword(""); 

    return ResponseEntity.ok(dto);
}


@PutMapping("/profile/update")
public ResponseEntity<String> updateAdminProfile(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody UpdateAdminRequest updateRequest) {

    Optional<Admin> optionalAdmin = adminService.findByEmail(userDetails.getUsername());
    if (optionalAdmin.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Admin bulunamadı.");
    }

    adminService.updateAdminProfile(optionalAdmin.get(), updateRequest);
    return ResponseEntity.ok("Profil bilgileri başarıyla güncellendi.");
}





}
