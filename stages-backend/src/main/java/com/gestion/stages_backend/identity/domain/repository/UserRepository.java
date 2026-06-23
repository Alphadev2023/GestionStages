package com.gestion.stages_backend.identity.domain.repository;

import com.gestion.stages_backend.identity.domain.model.User;
import java.util.Optional;

public interface UserRepository {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
