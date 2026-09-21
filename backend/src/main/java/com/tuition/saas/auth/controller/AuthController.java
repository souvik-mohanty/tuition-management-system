package com.tuition.saas.auth.controller;

import com.tuition.saas.auth.dto.FirebaseLoginRequest;
import com.tuition.saas.auth.dto.GoogleLoginRequest;
import com.tuition.saas.auth.dto.LoginResponse;
import com.tuition.saas.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** Exchanges a Firebase phone-auth ID token for our access JWT, the user and their tuition memberships. */
    @PostMapping("/firebase")
    public LoginResponse firebaseLogin(@Valid @RequestBody FirebaseLoginRequest request, HttpServletRequest http) {
        return authService.loginWithFirebase(request.idToken(), http.getRemoteAddr());
    }

    /** Exchanges a Google Sign-In ID token for our access JWT (user must already be registered by email). */
    @PostMapping("/google")
    public LoginResponse googleLogin(@Valid @RequestBody GoogleLoginRequest request, HttpServletRequest http) {
        return authService.loginWithGoogle(request.idToken(), http.getRemoteAddr());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@AuthenticationPrincipal Jwt jwt) {
        authService.logout(jwt.getId());
    }
}
