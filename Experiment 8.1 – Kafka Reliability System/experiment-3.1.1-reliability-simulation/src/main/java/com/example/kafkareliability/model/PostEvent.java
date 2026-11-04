package com.example.kafkareliability.model;

public class PostEvent {
    private String eventId;
    private String postText;
    private boolean simulateFailure;
    public PostEvent() {}
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public String getPostText() { return postText; }
    public void setPostText(String postText) { this.postText = postText; }
    public boolean isSimulateFailure() { return simulateFailure; }
    public void setSimulateFailure(boolean simulateFailure) { this.simulateFailure = simulateFailure; }
}
