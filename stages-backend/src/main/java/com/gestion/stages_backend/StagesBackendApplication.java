package com.gestion.stages_backend;

import de.codecentric.boot.admin.server.config.AdminServerAutoConfiguration;
import de.codecentric.boot.admin.server.config.AdminServerNotifierAutoConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(exclude = {
    AdminServerAutoConfiguration.class,
    AdminServerNotifierAutoConfiguration.class
})
@EnableJpaAuditing
public class StagesBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(StagesBackendApplication.class, args);
    }
}
