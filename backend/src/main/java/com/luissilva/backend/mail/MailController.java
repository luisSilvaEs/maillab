package com.luissilva.backend.mail;

import com.luissilva.backend.mail.dto.SendMailRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
public class MailController {

    private final MailService mailService;

    @PostMapping("/send")
    public ResponseEntity<Void> send(@Valid @RequestBody SendMailRequest request) {
        mailService.send(request.getTo(), request.getSubject(), request.getBody());
        return ResponseEntity.ok().build();
    }
}