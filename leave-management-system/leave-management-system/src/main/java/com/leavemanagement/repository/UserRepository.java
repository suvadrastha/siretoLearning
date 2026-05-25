package com.leavemanagement.repository;

import com.leavemanagement.enums.Role;
import com.leavemanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;


public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByKeycloakUserId(String keycloakUserId);
    Optional<User> findByEmail(String email);
    List<User> findByRole(Role role);

}