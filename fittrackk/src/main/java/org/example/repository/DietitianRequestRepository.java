package org.example.repository;

import org.example.model.DietitianRequest;
import org.example.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DietitianRequestRepository extends JpaRepository<DietitianRequest, Long> {

    List<DietitianRequest> findByClient(Client client);

    List<DietitianRequest> findByStatus(String status);

    boolean existsByClientAndStatus(Client client, String status);

    boolean existsByClient_Id(Long clientId);
}

