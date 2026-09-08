package com.meetmind.dto;

import java.util.ArrayList;
import java.util.List;

public class AnalyzeResponse {

    private String summary;
    private List<String> importantPoints = new ArrayList<>();
    private List<String> decisions = new ArrayList<>();
    private List<ActionItem> actionItems = new ArrayList<>();
    private List<String> deadlines = new ArrayList<>();
    private List<String> unresolvedQuestions = new ArrayList<>();

    public AnalyzeResponse() {}

    public AnalyzeResponse(String summary, List<String> importantPoints, List<String> decisions,
                           List<ActionItem> actionItems, List<String> deadlines, List<String> unresolvedQuestions) {
        this.summary = summary;
        this.importantPoints = importantPoints != null ? importantPoints : new ArrayList<>();
        this.decisions = decisions != null ? decisions : new ArrayList<>();
        this.actionItems = actionItems != null ? actionItems : new ArrayList<>();
        this.deadlines = deadlines != null ? deadlines : new ArrayList<>();
        this.unresolvedQuestions = unresolvedQuestions != null ? unresolvedQuestions : new ArrayList<>();
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getImportantPoints() {
        return importantPoints;
    }

    public void setImportantPoints(List<String> importantPoints) {
        this.importantPoints = importantPoints;
    }

    public List<String> getDecisions() {
        return decisions;
    }

    public void setDecisions(List<String> decisions) {
        this.decisions = decisions;
    }

    public List<ActionItem> getActionItems() {
        return actionItems;
    }

    public void setActionItems(List<ActionItem> actionItems) {
        this.actionItems = actionItems;
    }

    public List<String> getDeadlines() {
        return deadlines;
    }

    public void setDeadlines(List<String> deadlines) {
        this.deadlines = deadlines;
    }

    public List<String> getUnresolvedQuestions() {
        return unresolvedQuestions;
    }

    public void setUnresolvedQuestions(List<String> unresolvedQuestions) {
        this.unresolvedQuestions = unresolvedQuestions;
    }

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
}
