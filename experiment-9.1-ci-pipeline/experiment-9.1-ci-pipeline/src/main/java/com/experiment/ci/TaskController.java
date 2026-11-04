package com.experiment.ci;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    public record Task(long id, String title, String status) {}
    public record CreateTaskRequest(@NotBlank String title) {}
    private final Map<Long, Task> tasks = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong();

    @GetMapping
    public List<Task> all() {
        return tasks.values().stream().sorted(Comparator.comparingLong(Task::id)).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Task create(@Valid @RequestBody CreateTaskRequest request) {
        long id = sequence.incrementAndGet();
        Task task = new Task(id, request.title().trim(), "QUEUED");
        tasks.put(id, task);
        return task;
    }

    @PatchMapping("/{id}/status")
    public Task updateStatus(@PathVariable long id, @RequestParam String status) {
        if (!Set.of("QUEUED", "RUNNING", "PASSED", "FAILED").contains(status.toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported status");
        }
        Task old = tasks.get(id);
        if (old == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found");
        Task updated = new Task(old.id(), old.title(), status.toUpperCase());
        tasks.put(id, updated);
        return updated;
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clear() {
        tasks.clear();
        sequence.set(0);
    }
}
