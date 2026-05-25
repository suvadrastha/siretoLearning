package com.leavemanagement.model;

import com.leavemanagement.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import lombok.Builder;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String keycloakUserId;

    private String username;

    private String email;

    private String fullName;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String department;
}