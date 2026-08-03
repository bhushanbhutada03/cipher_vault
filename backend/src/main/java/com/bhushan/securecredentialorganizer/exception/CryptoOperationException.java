package com.bhushan.securecredentialorganizer.exception;

public class CryptoOperationException extends RuntimeException {

    public CryptoOperationException(String message) {
        super(message);
    }

    public CryptoOperationException(String message, Throwable cause) {
        // We preserve the cause for stack tracing, but must ensure that the 
        // global exception handler does not serialize the inner exception message 
        // to the client or log raw bytes.
        super(message, cause);
    }
}
