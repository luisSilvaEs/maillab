package com.luissilva.backend.mail;

import com.luissilva.backend.mail.dto.SendMailRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.luissilva.backend.mail.imap.ImapService;
import com.luissilva.backend.mail.imap.dto.MailMessageDetailDto;
import com.luissilva.backend.mail.imap.dto.MailMessageDto;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
public class MailController {

    private final MailService mailService;
    private final ImapService imapService;

    @PostMapping("/send")
    public ResponseEntity<Void> send(@Valid @RequestBody SendMailRequest request) {
        mailService.send(request.getTo(), request.getSubject(), request.getBody());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<MailMessageDto>> getInbox(Authentication authentication) {
        String username = authentication.getName();
        String password = extractPassword(authentication);
        return ResponseEntity.ok(imapService.fetchInbox(username, password));
    }

    @GetMapping("/{uid}")
    public ResponseEntity<MailMessageDetailDto> getMessage(
            @PathVariable long uid,
            Authentication authentication) {
        String username = authentication.getName();
        String password = extractPassword(authentication);
        return ResponseEntity.ok(imapService.fetchMessage(username, password, uid));
    }

    private String extractPassword(Authentication authentication) {
        Object credentials = authentication.getCredentials();
        if (credentials == null) {
            throw new RuntimeException("No credentials available in security context");
        }
        return credentials.toString();
    }
}