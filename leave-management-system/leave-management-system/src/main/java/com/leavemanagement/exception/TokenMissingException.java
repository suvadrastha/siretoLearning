package com.leavemanagement.exception;

public class
TokenMissingException extends RuntimeException {
    public TokenMissingException(String message) {
        super(message);
    }

    public TokenMissingException(String message, Throwable cause) {
        super(message, cause);
    }
}

