package com.meetmind.dto;

import java.util.List;

public class AppConfigResponse {

    private List<String> allowedFormats;
    private long maxSizeBytes;
    private String serverStatus;

    public AppConfigResponse() {}

    public AppConfigResponse(List<String> allowedFormats, long maxSizeBytes, String serverStatus) {
        this.allowedFormats = allowedFormats;
        this.maxSizeBytes = maxSizeBytes;
        this.serverStatus = serverStatus;
    }

    public List<String> getAllowedFormats() { return allowedFormats; }
    public void setAllowedFormats(List<String> allowedFormats) { this.allowedFormats = allowedFormats; }

    public long getMaxSizeBytes() { return maxSizeBytes; }
    public void setMaxSizeBytes(long maxSizeBytes) { this.maxSizeBytes = maxSizeBytes; }

    public String getServerStatus() { return serverStatus; }
    public void setServerStatus(String serverStatus) { this.serverStatus = serverStatus; }
}
