package com.example.kafkareliability.controller;

import com.example.kafkareliability.model.PostEvent;
import com.example.kafkareliability.service.ActivityLog;
import com.example.kafkareliability.service.IdempotencyService;
import com.example.kafkareliability.service.PostEventProducer;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class EventController {
    private final PostEventProducer producer;
    private final ActivityLog log;
    private final IdempotencyService ids;
    public EventController(PostEventProducer producer, ActivityLog log, IdempotencyService ids) {
        this.producer = producer; this.log = log; this.ids = ids;
    }
    @PostMapping("/events")
    public ResponseEntity<?> publish(@RequestBody PostEvent event) {
        try {
            producer.publish(event);
            return ResponseEntity.accepted().body(Map.of("message", "Event processed by reliability simulation", "eventId", event.getEventId()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
    @GetMapping("/activity")
    public Map<String, Object> activity() { return Map.of("items", log.recent(), "processedCount", ids.count()); }
    @GetMapping("/health")
    public Map<String, String> health() { return Map.of("status", "UP", "service", "Reliability Simulation Lab", "mode", "in-memory simulation; Kafka is not used"); }
}
