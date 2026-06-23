package com.gestion.stages_backend.shared.infrastructure.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " introuvable avec l''id : " + id);
    }
}