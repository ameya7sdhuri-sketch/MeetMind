package com.meetmind.controller;

import com.meetmind.dto.AppConfigResponse;
import com.meetmind.service.FileValidationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ConfigController {

    private final FileValidationService fileValidationService;

    public ConfigController(FileValidationService fileValidationService) {
        this.fileValidationService = fileValidationService;
    }

    @GetMapping("/config")
    public ResponseEntity<AppConfigResponse> getConfig() {
        AppConfigResponse config = new AppConfigResponse(
            fileValidationService.getAllowedFormats(),
            fileValidationService.getMaxSizeBytes(),
            "ONLINE_ACTIVE"
        );
        return ResponseEntity.ok(config);
    }
}
