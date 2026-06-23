package com.gestion.stages_backend.shared.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/files")
public class FileController {

    @Value("${storage.local.path:uploads}")
    private String uploadPath;

    @GetMapping("/**")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
        try {
            String requestUri = request.getRequestURI();
            String filePath = requestUri.substring("/files/".length());
            filePath = java.net.URLDecoder.decode(filePath, java.nio.charset.StandardCharsets.UTF_8);

            Path file = Paths.get(uploadPath).resolve(filePath).normalize();
            Resource resource = new UrlResource(file.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = "application/octet-stream";
            String filename = resource.getFilename();
            if (filename != null && filename.endsWith(".pdf")) {
                contentType = "application/pdf";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
