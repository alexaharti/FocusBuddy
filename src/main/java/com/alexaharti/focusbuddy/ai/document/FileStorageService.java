package com.alexaharti.focusbuddy.ai.document;

import com.alexaharti.focusbuddy.common.exception.FileStorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadDirectory;

    public FileStorageService(
            @Value("${app.storage.upload-dir}") String uploadDirectory
    ) {
        this.uploadDirectory = Path.of(uploadDirectory)
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(this.uploadDirectory);
        } catch (IOException exception) {
            throw new FileStorageException(
                    "Could not create the upload directory",
                    exception
            );
        }
    }

    public StoredFile storePdf(MultipartFile file) {
        validatePdf(file);

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "lecture.pdf";
        }

        String storedFilename = UUID.randomUUID() + ".pdf";
        Path targetPath = uploadDirectory.resolve(storedFilename).normalize();

        if (!targetPath.startsWith(uploadDirectory)) {
            throw new FileStorageException("Invalid file-storage path");
        }

        try {
            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );
        } catch (IOException exception) {
            throw new FileStorageException(
                    "Could not store the uploaded PDF",
                    exception
            );
        }

        return new StoredFile(
                originalFilename,
                storedFilename,
                targetPath.toString(),
                file.getContentType(),
                file.getSize()
        );
    }

    public void deleteQuietly(String storagePath) {
        if (storagePath == null || storagePath.isBlank()) {
            return;
        }

        try {
            Files.deleteIfExists(Path.of(storagePath));
        } catch (IOException ignored) {
            // Database operation remains the primary operation.
        }
    }

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("A PDF file is required");
        }

        String originalFilename = file.getOriginalFilename();
        boolean hasPdfExtension = originalFilename != null
                && originalFilename
                .toLowerCase(Locale.ROOT)
                .endsWith(".pdf");

        boolean hasPdfContentType =
                "application/pdf".equalsIgnoreCase(file.getContentType());

        if (!hasPdfExtension || !hasPdfContentType) {
            throw new FileStorageException(
                    "Only PDF files are supported"
            );
        }
    }

    public record StoredFile(
            String originalFilename,
            String storedFilename,
            String storagePath,
            String mimeType,
            long fileSize
    ) {
    }
}