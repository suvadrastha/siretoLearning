package com.leavemanagement.service;

import com.leavemanagement.enums.Role;
import com.leavemanagement.model.User;
import com.leavemanagement.repository.UserRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private User getCurrentUser(Jwt jwt) {
        String keycloakUserId = jwt.getSubject();

        return userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new RuntimeException("User not found in database"));
    }

    public User getOrCreateUserFromJwt(Jwt jwt) {
        String keycloakUserId = jwt.getSubject();
        Role role = extractRole(jwt);


        return userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .keycloakUserId(keycloakUserId)
                                .username(jwt.getClaimAsString("preferred_username"))
                                .email(jwt.getClaimAsString("email"))
                                .fullName(jwt.getClaimAsString("name"))
                                .role(role)
                                .build()
                ));
    }


    private Role extractRole(Jwt jwt) {

        Map<String, Object> resourceAccess = jwt.getClaim("resource_access");

        Map<String, Object> client =
                (Map<String, Object>) resourceAccess.get("leave-management-web");

        Collection<String> roles =
                (Collection<String>) client.get("roles");

        String role = roles.iterator().next();

        return Role.valueOf(role.toUpperCase());
    }

    public List<User> getAllUsersForAdmin(Jwt jwt) {

        User admin = getCurrentUser(jwt);

        if (admin.getRole() != Role.ROLE_ADMIN) {
            throw new RuntimeException("Only admin can view users");
        }

        return userRepository.findByRole(Role.ROLE_USER);
    }
}