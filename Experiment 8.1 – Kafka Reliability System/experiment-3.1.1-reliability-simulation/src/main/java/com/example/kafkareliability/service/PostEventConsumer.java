package com.example.kafkareliability.service;

import com.example.kafkareliability.model.PostEvent;
import org.springframework.stereotype.Service;

@Service
public class PostEventConsumer {
    private final IdempotencyService ids;
    private final ActivityLog log;

    public PostEventConsumer(IdempotencyService ids, ActivityLog log) {
        this.ids = ids;
        this.log = log;
    }

    public void consume(PostEvent event) {
        String id = event.getEventId();
        log.add(id, "RECEIVED", "Simulation received event for processing.");
        // Idempotency is checked before processing. A failed event is not marked processed.
        if (idsAlreadyProcessed(id)) {
            log.add(id, "DUPLICATE", "Duplicate event ID skipped; it was already processed.");
            return;
        }

        int maxAttempts = 4;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            log.add(id, "PROCESSING", "Processing attempt " + attempt + " of " + maxAttempts + ".");
            try {
                if (event.isSimulateFailure()) throw new IllegalStateException("Simulated failure requested by user");
                if (!ids.markIfNew(id)) {
                    log.add(id, "DUPLICATE", "Duplicate event ID skipped.");
                    return;
                }
                log.add(id, "PROCESSED", "Successfully processed: " + event.getPostText());
                return;
            } catch (RuntimeException ex) {
                log.add(id, "RETRY", "Attempt " + attempt + " failed: " + ex.getMessage());
                if (attempt < maxAttempts) {
                    long delay = 1000L * (1L << (attempt - 1)); // 1s, 2s, 4s
                    log.add(id, "WAITING", "Exponential backoff: waiting " + (delay / 1000) + " second(s).");
                    try { Thread.sleep(delay); }
                    catch (InterruptedException interrupted) {
                        Thread.currentThread().interrupt();
                        log.add(id, "ERROR", "Retry sequence interrupted.");
                        return;
                    }
                }
            }
        }
        log.add(id, "DLQ", "All retries exhausted. Event moved to the simulated Dead Letter Queue.");
    }

    private boolean idsAlreadyProcessed(String id) {
        // A duplicate check without mutating the idempotency set.
        // Existing IDs are detected by a separate set lookup exposed below.
        return ids.contains(id);
    }
}
