package com.luissilva.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record Verify2faRequest(

        @NotBlank(message = "Username is required") String username,

        @NotNull(message = "TOTP code is required") Integer code) {
}