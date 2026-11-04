package com.example.kafkareliability.service;

import com.example.kafkareliability.model.PostEvent;
import org.springframework.stereotype.Service;

@Service
public class PostEventProducer {
    private final PostEventConsumer consumer;
    private final ActivityLog log;
    public PostEventProducer(PostEventConsumer consumer, ActivityLog log) {
        this.consumer = consumer;
        this.log = log;
    }
    public void publish(PostEvent event) {
        if (event.getEventId() == null || event.getEventId().isBlank()) throw new IllegalArgumentException("Event ID is required");
        if (event.getPostText() == null || event.getPostText().isBlank()) throw new IllegalArgumentException("Post text is required");
        log.add(event.getEventId(), "PUBLISHED", "Event accepted by the simulated in-memory queue.");
        consumer.consume(event);
    }
}
