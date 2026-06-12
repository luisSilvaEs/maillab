package com.luissilva.backend.auth;

import com.luissilva.backend.auth.dto.AuthResponse;
import com.luissilva.backend.auth.dto.LoginRequest;
import com.luissilva.backend.auth.dto.RegisterRequest;
import com.luissilva.backend.auth.dto.Verify2faRequest;
import com.google.zxing.WriterException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) throws NoSuchAlgorithmException {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<AuthResponse> verifyTwoFactor(
            @Valid @RequestBody Verify2faRequest request) {
        return ResponseEntity.ok(authService.verifyTwoFactor(request));
    }

    // Protected — requires a valid JWT
    @PostMapping("/setup-2fa")
    public ResponseEntity<AuthResponse> setupTwoFactor(
            @AuthenticationPrincipal UserDetails userDetails)
            throws NoSuchAlgorithmException, WriterException, IOException {
        return ResponseEntity.ok(authService.setupTwoFactor(userDetails.getUsername()));
    }
}