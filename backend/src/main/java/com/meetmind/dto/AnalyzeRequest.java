package com.meetmind.dto;

import jakarta.validation.constraints.NotBlank;

public class AnalyzeRequest {

    @NotBlank(message = "Transcript cannot be empty.")
    private String transcript;

    public AnalyzeRequest() {}

    public AnalyzeRequest(String transcript) {
        this.transcript = transcript;
    }

    public String getTranscript() {
        return transcript;
    }

    public void setTranscript(String transcript) {
        this.transcript = transcript;
    }
}
