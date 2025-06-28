package org.example.dto;
import lombok.Data;


@Data
public class UpdateClientRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private int age;
private String gender;

}
