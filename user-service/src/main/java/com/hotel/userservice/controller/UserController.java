package com.hotel.userservice.controller;

import com.hotel.userservice.model.User;
import com.hotel.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{keycloakId}")
    public ResponseEntity<User> getUser(@PathVariable String keycloakId) {
        return userService.getUserByKeycloakId(keycloakId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{keycloakId}")
    public ResponseEntity<User> updateUser(@PathVariable String keycloakId, @RequestBody User userDetails) {
        try {
            return ResponseEntity.ok(userService.updateUser(keycloakId, userDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
