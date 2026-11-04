package com.example.kafkareliability.service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class IdempotencyService {
    private final Set<String> processed = ConcurrentHashMap.newKeySet();
    public boolean markIfNew(String id) { return processed.add(id); }
    public boolean contains(String id) { return processed.contains(id); }
    public int count() { return processed.size(); }
}
