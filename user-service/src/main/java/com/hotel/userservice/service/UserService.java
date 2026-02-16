package com.hotel.userservice.service;

import com.hotel.userservice.model.User;
import com.hotel.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User createUser(User user) {
        // Check if user already exists by keycloakId
        Optional<User> existingUser = userRepository.findByKeycloakId(user.getKeycloakId());
        if (existingUser.isPresent()) {
            // User already exists, return existing user
            return existingUser.get();
        }
        
        // Check if user exists by email (if email is provided)
        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            Optional<User> existingByEmail = userRepository.findByEmail(user.getEmail());
            if (existingByEmail.isPresent()) {
                // Email already exists, return existing user
                return existingByEmail.get();
            }
        }
        
        // Create new user
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserByKeycloakId(String keycloakId) {
        return userRepository.findByKeycloakId(keycloakId);
    }

    public User updateUser(String keycloakId, User userDetails) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setPhoneNumber(userDetails.getPhoneNumber());
        user.setPreferences(userDetails.getPreferences());
        return userRepository.save(user);
    }
}
