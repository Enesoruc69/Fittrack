package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.dto.AdminUserCreationRequest;
import org.example.dto.ClientAdminDto;
import org.example.dto.DietitianDto;
import org.example.dto.UpdateAdminRequest;
import org.example.model.*;
import org.example.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ClientRepository clientRepository;
    private final DietitianRepository dietitianRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final DietTypeRepository dietTypeRepository;
    private final HealthInfoRepository healthInfoRepository;
    private final TrackingRepository trackingRepository;
    private final DietListRepository dietListRepository;
    private final MessageRepository messageRepository;
    private final DietitianRequestService dietitianRequestService;
    private final NoteRepository noteRepository;
    @PersistenceContext
    private EntityManager entityManager;

    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    @Transactional
    public DietitianDto promoteClientToDietitian(Long clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client bulunamadı"));

        // 0. DietitianRequest varsa sil
        dietitianRequestService.deleteRequestsByClient(client);

        // 1. Tracking silinmeli
        List<Tracking> trackings = trackingRepository.findAllByClient(client);
        if (!trackings.isEmpty()) {
            trackingRepository.deleteAll(trackings);
        }

        // 2. HealthInfo silinmeli
        healthInfoRepository.findByClient(client)
                .ifPresent(healthInfoRepository::delete);

        // 3. DietList varsa silinmeli
        List<DietList> dietLists = dietListRepository.findAllByClient(client);
        if (!dietLists.isEmpty()) {
            dietListRepository.deleteAll(dietLists);
        }

        // 4. Client silinmeli
        clientRepository.delete(client);

        // Zorla veritabanına işle (email çakışmasını önler!)
        entityManager.flush();

        // 5. Yeni dietitian oluşturulmalı
        Dietitian dietitian = Dietitian.builder()
                .email(client.getEmail())
                .password(client.getPassword())
                .firstName(client.getFirstName())
                .lastName(client.getLastName())
                .role(Role.DIETITIAN)
                .build();

        dietitianRepository.save(dietitian);

        return new DietitianDto(
                dietitian.getId(),
                dietitian.getFirstName(),
                dietitian.getLastName(),
                dietitian.getEmail(),
                dietitian.getRole().name()
        );
    }

    public void createUserAsAdmin(AdminUserCreationRequest request) {
        String userType = request.getUserType().toUpperCase();

        switch (userType) {
            case "CLIENT" -> {
                DietType dietType = null;
                if (request.getDietTypeName() != null && !request.getDietTypeName().isBlank()) {
                    dietType = dietTypeRepository.findByName(request.getDietTypeName())
                            .orElseThrow(() -> new RuntimeException("Diyet tipi bulunamadı: " + request.getDietTypeName()));
                }

                Client client = Client.builder()
                        .email(request.getEmail())
                        .password(passwordEncoder.encode(request.getPassword()))
                        .firstName(request.getFirstName())
                        .lastName(request.getLastName())
                        .age(request.getAge())
                        .gender(request.getGender())
                        .dietType(dietType)
                        .role(Role.CLIENT)
                        .isActive(true)
                        .createdAt(LocalDateTime.now())
                        .build();

                clientRepository.save(client);
            }

            case "DIETITIAN" -> {
                Dietitian dietitian = Dietitian.builder()
                        .email(request.getEmail())
                        .password(passwordEncoder.encode(request.getPassword()))
                        .firstName(request.getFirstName())
                        .lastName(request.getLastName())
                        .role(Role.DIETITIAN)
                        .build();

                dietitianRepository.save(dietitian);
            }

            default -> throw new IllegalArgumentException("Geçersiz kullanıcı tipi: " + request.getUserType());
        }
    }

    @Transactional
    public void deleteClientById(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Silinecek client bulunamadı."));

        // 0. DietitianRequest varsa sil
        dietitianRequestService.deleteRequestsByClient(client);

        List<Tracking> trackings = trackingRepository.findAllByClient(client);
        if (!trackings.isEmpty()) {
            trackingRepository.deleteAll(trackings);
        }

        healthInfoRepository.findByClient(client).ifPresent(healthInfoRepository::delete);

        clientRepository.delete(client);
    }

    @Transactional
    public void deleteDietitianById(Long id) {
        Dietitian dietitian = dietitianRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Silinecek diyetisyen bulunamadı."));

        // Diyetisyenin notlarını sil
        List<Note> notes = noteRepository.findAllByDietitianId(id);
        if (!notes.isEmpty()) {
            noteRepository.deleteAll(notes);
        }

        // Diyetisyeni sil
        dietitianRepository.delete(dietitian);
    }


    public List<ClientAdminDto> getAllClientsAsDto() {
        return clientRepository.findAll().stream().map(client -> {
            ClientAdminDto dto = new ClientAdminDto();
            dto.setId(client.getId());
            dto.setFirstName(client.getFirstName());
            dto.setLastName(client.getLastName());
            dto.setEmail(client.getEmail());
            dto.setGender(client.getGender());
            dto.setAge(client.getAge());
            return dto;
        }).toList();
    }

    public Optional<Admin> findByEmail(String email) {
    return adminRepository.findByEmail(email);
}

@Transactional
public void updateAdminProfile(Admin admin, UpdateAdminRequest request) {
    if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
        admin.setFirstName(request.getFirstName());
    }

    if (request.getLastName() != null && !request.getLastName().isBlank()) {
        admin.setLastName(request.getLastName());
    }

    if (request.getEmail() != null && !request.getEmail().isBlank()) {
        admin.setEmail(request.getEmail());
    }

    if (request.getPassword() != null && !request.getPassword().isBlank()) {
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
    }

    adminRepository.save(admin);
}



}
