package com.meetmind.dto;

import java.util.List;

public class AiQuestionRequest {

    private String question;
    private List<AnalysisResponse.TranscriptLine> context;

    public AiQuestionRequest() {}

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public List<AnalysisResponse.TranscriptLine> getContext() { return context; }
    public void setContext(List<AnalysisResponse.TranscriptLine> context) { this.context = context; }
}
