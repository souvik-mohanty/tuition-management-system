package com.tuition.saas.common.exception;

public class NoActiveAcademicYearException extends RuntimeException {
    public NoActiveAcademicYearException(String message) {
        super(message);
    }
}
