package com.meetmind.dto;

import java.util.List;

public class AiQuestionResponse {

    private String answer;
    private List<String> citations;
    private String timestamp;

    public AiQuestionResponse() {}

    public AiQuestionResponse(String answer, List<String> citations, String timestamp) {
        this.answer = answer;
        this.citations = citations;
        this.timestamp = timestamp;
    }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public List<String> getCitations() { return citations; }
    public void setCitations(List<String> citations) { this.citations = citations; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
