package com.questio.questio_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class TaskMaterialStorageService {

    private final Path rootDirectory;

    public TaskMaterialStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) throws IOException {
        this.rootDirectory = Path.of(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.rootDirectory.resolve("materiais"));
    }

    public StoredTaskMaterialFile store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "material"
        );

        String extension = "";
        int lastDot = originalFilename.lastIndexOf('.');
        if (lastDot >= 0) {
            extension = originalFilename.substring(lastDot);
        }

        String storedFilename = UUID.randomUUID() + extension;
        Path targetPath = rootDirectory.resolve("materiais").resolve(storedFilename).normalize();

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            return new StoredTaskMaterialFile(
                    originalFilename,
                    targetPath.toString()
            );
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível salvar o material da tarefa.", e);
        }
    }

    public Path load(String storedPath) {
        if (storedPath == null || storedPath.isBlank()) {
            throw new RuntimeException("Arquivo não encontrado.");
        }

        Path path = Path.of(storedPath).toAbsolutePath().normalize();
        if (!path.startsWith(rootDirectory) || !Files.exists(path)) {
            throw new RuntimeException("Arquivo não encontrado.");
        }

        return path;
    }

    public record StoredTaskMaterialFile(
            String originalFilename,
            String storedPath
    ) {
    }
}

