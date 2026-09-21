package com.tuition.saas.common.exception;

import org.springframework.http.HttpStatus;

public class AuthException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    public AuthException(HttpStatus status, String message) {
        this(status, message, null);
    }

    /** code is a short, non-sensitive machine-readable reason (e.g. audience_mismatch) shown to help support. */
    public AuthException(HttpStatus status, String message, String code) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
