package com.leavemanagement.controller;

import com.leavemanagement.model.User;
import com.leavemanagement.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import com.leavemanagement.model.User;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public User getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        System.out.println("Received JWT: " + jwt);
        return userService.getOrCreateUserFromJwt(jwt);
    }


    @GetMapping("/admin/all-users")
    public List<User> getAllUsersForAdmin(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return userService.getAllUsersForAdmin(jwt);
    }
}