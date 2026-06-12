package com.luissilva.backend.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AuthResponse(

        // Present when authentication is complete
        String token,

        // Present when 2FA is required — tells the client to show the TOTP input
        Boolean requiresTwoFactor,

        // Present after setup-2fa — the base64 QR code image
        String qrCode,

        // Human-readable message
        String message) {
    public static AuthResponse withToken(String token) {
        return new AuthResponse(token, null, null, null);
    }

    public static AuthResponse twoFactorRequired() {
        return new AuthResponse(null, true, null, null);
    }

    public static AuthResponse withQrCode(String qrCode) {
        return new AuthResponse(null, null, qrCode, "Scan this QR code with your authenticator app");
    }

    public static AuthResponse withMessage(String message) {
        return new AuthResponse(null, null, null, message);
    }
}