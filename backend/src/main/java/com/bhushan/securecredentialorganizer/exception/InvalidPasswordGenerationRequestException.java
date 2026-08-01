package com.bhushan.securecredentialorganizer.exception;

public class InvalidPasswordGenerationRequestException extends RuntimeException {

    public InvalidPasswordGenerationRequestException(String message) {
        super(message);
    }

}