package com.meetmind.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@Service
public class FileValidationService {

    @Value("${meetmind.allowed-formats:mp3,wav,m4a,mp4,webm,ogg}")
    private String allowedFormatsString;

    @Value("${meetmind.max-file-size-bytes:157286400}")
    private long maxSizeBytes;

    public List<String> getAllowedFormats() {
        return Arrays.asList(allowedFormatsString.split(","));
    }

    public long getMaxSizeBytes() {
        return maxSizeBytes;
    }

    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file cannot be empty.");
        }

        if (file.getSize() > maxSizeBytes) {
            throw new IllegalArgumentException("File size (" + (file.getSize() / (1024 * 1024)) + "MB) exceeds maximum limit of " + (maxSizeBytes / (1024 * 1024)) + "MB.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new IllegalArgumentException("Invalid filename format.");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        List<String> allowed = getAllowedFormats();

        if (!allowed.contains(extension)) {
            throw new IllegalArgumentException("File format (." + extension + ") is not supported. Allowed formats: " + String.join(", ", allowed));
        }
    }
}
