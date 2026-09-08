package com.meetmind.controller;

import com.meetmind.dto.AiQuestionRequest;
import com.meetmind.dto.AiQuestionResponse;
import com.meetmind.dto.AnalysisResponse;
import com.meetmind.dto.AnalyzeRequest;
import com.meetmind.dto.AnalyzeResponse;
import com.meetmind.service.AiAnalysisService;
import com.meetmind.service.FileValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MeetingController {

    private final FileValidationService fileValidationService;
    private final AiAnalysisService aiAnalysisService;

    public MeetingController(FileValidationService fileValidationService, AiAnalysisService aiAnalysisService) {
        this.fileValidationService = fileValidationService;
        this.aiAnalysisService = aiAnalysisService;
    }

    @PostMapping("/ai/analyze")
    public ResponseEntity<?> analyzeTranscript(@RequestBody(required = false) AnalyzeRequest request) {
        try {
            if (request == null || request.getTranscript() == null || request.getTranscript().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Bad Request");
                error.put("message", "Transcript cannot be missing or empty.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            AnalyzeResponse response = aiAnalysisService.analyzeTranscript(request.getTranscript());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Bad Request");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            String msg = e.getMessage() != null ? e.getMessage() : "An unexpected error occurred.";
            error.put("error", "AI Analysis Error");
            error.put("message", msg);

            if (msg.contains("429") || msg.toLowerCase().contains("rate limit")) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(error);
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/process-audio")
    public ResponseEntity<?> processAudio(@RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            if (file != null && !file.isEmpty()) {
                fileValidationService.validateFile(file);
            }
            AnalysisResponse result = aiAnalysisService.processAudioFile(file);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Validation Error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal Processing Error");
            error.put("message", "An unexpected error occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/ask-ai")
    public ResponseEntity<?> askAI(@RequestBody AiQuestionRequest request) {
        try {
            if (request.getQuestion() == null || request.getQuestion().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Bad Request");
                error.put("message", "Question cannot be empty.");
                return ResponseEntity.badRequest().body(error);
            }
            AiQuestionResponse response = aiAnalysisService.answerQuestion(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "AI Query Error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
