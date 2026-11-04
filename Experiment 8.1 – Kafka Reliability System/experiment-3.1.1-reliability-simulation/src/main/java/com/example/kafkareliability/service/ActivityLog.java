package com.example.kafkareliability.service;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedDeque;
import org.springframework.stereotype.Service;

@Service
public class ActivityLog {
    public record Item(Instant time, String eventId, String status, String message) {}
    private final ConcurrentLinkedDeque<Item> items = new ConcurrentLinkedDeque<>();

    public void add(String eventId, String status, String message) {
        items.addFirst(new Item(Instant.now(), eventId, status, message));
        while (items.size() > 100) items.removeLast();
    }
    public List<Item> recent() { return items.stream().limit(50).toList(); }
}
