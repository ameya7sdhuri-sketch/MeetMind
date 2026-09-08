package com.meetmind.dto;

import java.util.List;

public class AnalysisResponse {

    private String title;
    private String meetingDate;
    private String duration;
    private String fileName;
    private String audioUrl;
    private String sentiment;
    private List<String> speakers;
    private String summary;
    private List<String> keyTakeaways;
    private List<ActionItem> actionItems;
    private List<TranscriptLine> transcript;

    public AnalysisResponse() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMeetingDate() { return meetingDate; }
    public void setMeetingDate(String meetingDate) { this.meetingDate = meetingDate; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }

    public String getSentiment() { return sentiment; }
    public void setSentiment(String sentiment) { this.sentiment = sentiment; }

    public List<String> getSpeakers() { return speakers; }
    public void setSpeakers(List<String> speakers) { this.speakers = speakers; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getKeyTakeaways() { return keyTakeaways; }
    public void setKeyTakeaways(List<String> keyTakeaways) { this.keyTakeaways = keyTakeaways; }

    public List<ActionItem> getActionItems() { return actionItems; }
    public void setActionItems(List<ActionItem> actionItems) { this.actionItems = actionItems; }

    public List<TranscriptLine> getTranscript() { return transcript; }
    public void setTranscript(List<TranscriptLine> transcript) { this.transcript = transcript; }

    public static class ActionItem {
        private long id;
        private String text;
        private String assignee;
        private boolean completed;
        private String priority;

        public ActionItem() {}

        public ActionItem(long id, String text, String assignee, boolean completed, String priority) {
            this.id = id;
            this.text = text;
            this.assignee = assignee;
            this.completed = completed;
            this.priority = priority;
        }

        public long getId() { return id; }
        public void setId(long id) { this.id = id; }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }

        public String getAssignee() { return assignee; }
        public void setAssignee(String assignee) { this.assignee = assignee; }

        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
    }

    public static class TranscriptLine {
        private String timestamp;
        private String speaker;
        private String text;

        public TranscriptLine() {}

        public TranscriptLine(String timestamp, String speaker, String text) {
            this.timestamp = timestamp;
            this.speaker = speaker;
            this.text = text;
        }

        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

        public String getSpeaker() { return speaker; }
        public void setSpeaker(String speaker) { this.speaker = speaker; }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
    }
}
