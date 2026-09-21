package com.tuition.saas.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** role (optional): the role the user chose to log in as: OWNER, TEACHER, STUDENT or PARENT. */
public record GoogleLoginRequest(
        @NotBlank(message = "idToken is required") String idToken,
        @Pattern(regexp = "OWNER|TEACHER|STUDENT|PARENT", message = "Invalid role") String role) {
}
