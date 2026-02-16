package com.hotel.notificationservice.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void sendEmail(String to, String subject, String body) {
        // Stub: In real app, use JavaMailSender
        System.out.println("-------------------------------------------------");
        System.out.println("Sending Email to: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Body: " + body);
        System.out.println("-------------------------------------------------");
    }
}
