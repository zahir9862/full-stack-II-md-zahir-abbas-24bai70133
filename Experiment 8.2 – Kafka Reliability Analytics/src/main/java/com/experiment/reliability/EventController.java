package com.experiment.reliability;

import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class EventController {
    private final Map<String, EventRecord> processed = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> activity = Collections.synchronizedList(new ArrayList<>());
    private final List<Map<String, Object>> dlq = Collections.synchronizedList(new ArrayList<>());
    private long sequence = 0;

    @PostMapping("/publish")
    public synchronized Map<String, Object> publish(@RequestBody PublishRequest request) {
        String eventId = (request.eventId() == null || request.eventId().isBlank())
                ? UUID.randomUUID().toString().substring(0, 8) : request.eventId().trim();
        if (processed.containsKey(eventId)) {
            log("DUPLICATE_IGNORED", eventId, "Idempotency key already processed; no second processing.");
            return response(eventId, "DUPLICATE_IGNORED", "This event ID was already processed. Duplicate prevented.");
        }

        int maxRetries = Math.max(0, Math.min(request.maxRetries() == null ? 3 : request.maxRetries(), 6));
        boolean shouldFail = Boolean.TRUE.equals(request.simulateFailure());
        int attempts = 0;
        long delayMs = 250;
        while (true) {
            attempts++;
            log("ATTEMPT", eventId, "Processing attempt " + attempts + ".");
            if (!shouldFail) {
                processed.put(eventId, new EventRecord(eventId, Instant.now().toString()));
                log("PROCESSED", eventId, "Event processed successfully on attempt " + attempts + ".");
                return response(eventId, "PROCESSED", "Success after " + attempts + " attempt(s).");
            }
            if (attempts > maxRetries) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("eventId", eventId); item.put("failedAt", Instant.now().toString());
                item.put("attempts", attempts); item.put("reason", "Simulated processing failure after retries exhausted.");
                dlq.add(item);
                log("SENT_TO_DLQ", eventId, "Retries exhausted; event routed to Dead Letter Queue.");
                return response(eventId, "SENT_TO_DLQ", "Retries exhausted. Event was sent to the DLQ after " + attempts + " attempt(s).");
            }
            log("RETRY_SCHEDULED", eventId, "Retry " + attempts + " scheduled after " + delayMs + " ms (exponential backoff).");
            // This is a visual/logic simulation: don't sleep, so the browser responds immediately.
            delayMs *= 2;
        }
    }

    @GetMapping("/state")
    public Map<String, Object> state() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("activity", new ArrayList<>(activity));
        result.put("dlq", new ArrayList<>(dlq));
        result.put("processedCount", processed.size());
        result.put("dlqCount", dlq.size());
        result.put("processedIds", new ArrayList<>(processed.keySet()));
        return result;
    }

    @PostMapping("/reset")
    public synchronized Map<String, String> reset() {
        processed.clear(); activity.clear(); dlq.clear(); sequence = 0;
        return Map.of("status", "reset");
    }

    private Map<String, Object> response(String id, String status, String message) {
        return Map.of("eventId", id, "status", status, "message", message);
    }
    private void log(String type, String id, String message) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("sequence", ++sequence); row.put("time", Instant.now().toString());
        row.put("type", type); row.put("eventId", id); row.put("message", message);
        activity.add(0, row);
    }
    public record PublishRequest(String eventId, Boolean simulateFailure, Integer maxRetries) {}
    private record EventRecord(String eventId, String processedAt) {}
}
