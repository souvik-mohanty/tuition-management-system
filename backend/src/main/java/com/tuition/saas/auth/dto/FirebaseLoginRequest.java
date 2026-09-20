package com.tuition.saas.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record FirebaseLoginRequest(@NotBlank(message = "idToken is required") String idToken) {
}
