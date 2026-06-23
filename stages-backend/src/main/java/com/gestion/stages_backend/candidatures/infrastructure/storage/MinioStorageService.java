package com.gestion.stages_backend.candidatures.infrastructure.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
public class MinioStorageService {

    @Value("${storage.local.path:uploads}")
    private String uploadPath;

    @Value("${storage.local.url:http://localhost:8082/files}")
    private String baseUrl;

    public String uploadFile(MultipartFile file, String prefix) {
        try {
            Path uploadDir = Paths.get(uploadPath, prefix);
            Files.createDirectories(uploadDir);

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadDir.resolve(fileName);
            Files.write(filePath, file.getBytes());

            log.info("Fichier sauvegarde : {}", filePath);
            return baseUrl + "/" + prefix + "/" + fileName;
        } catch (IOException e) {
            log.error("Erreur upload fichier", e);
            throw new RuntimeException("Erreur lors de la sauvegarde du fichier");
        }
    }
}
