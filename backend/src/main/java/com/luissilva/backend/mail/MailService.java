package com.luissilva.backend.mail;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final EmailService emailService;

    public void send(String to, String subject, String body) {
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        String from = username + "@luissilvacoding.com";

        emailService.send(from, to, subject, body);
    }
}