package org.example.dto;

import lombok.Data;

@Data
public class UpdateAdminRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password; 
}
