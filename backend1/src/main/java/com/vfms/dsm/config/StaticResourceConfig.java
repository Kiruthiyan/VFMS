package com.vfms.dsm.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads/documents}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadsPath = Paths.get(uploadDir).toAbsolutePath().getParent();
        String fileLocation = uploadsPath.toUri().toString();
        // Ensure trailing slash for proper resource location
        if (!fileLocation.endsWith("/")) {
            fileLocation += "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(fileLocation);
    }
}
