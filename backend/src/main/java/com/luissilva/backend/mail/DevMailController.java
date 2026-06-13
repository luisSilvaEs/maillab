package com.luissilva.backend.mail;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dev")
@RequiredArgsConstructor
@Profile("dev") // only active with Spring profile "dev"
public class DevMailController {

    private final EmailService emailService;

    @PostMapping("/send-test-email")
    public ResponseEntity<String> sendTestEmail(@Valid @RequestBody TestEmailRequest request) {
        emailService.send(request.to(), request.subject(), request.body());
        return ResponseEntity.ok("Email sent — check Mailpit at http://localhost:8025");
    }

    public record TestEmailRequest(
            @Email @NotBlank String to,
            @NotBlank String subject,
            @NotBlank String body) {
    }
}