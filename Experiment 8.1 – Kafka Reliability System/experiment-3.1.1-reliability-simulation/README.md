# Experiment 3.1.1 — Reliability Lab (No Kafka / No Docker)

This student-friendly version demonstrates reliability concepts using an in-memory Java simulation. It does **not** connect to Apache Kafka and should be described to your instructor as a simulation if real Kafka is not required.

## Requirements
- Java JDK 17 or newer
- Maven 3.8+
- VS Code (or another Java IDE)
- Internet access on first run so Maven can download Spring Boot dependencies

## Run in VS Code on Windows
1. Extract this ZIP.
2. In VS Code choose **File → Open Folder** and select the folder containing `pom.xml`.
3. Open **Terminal → New Terminal**.
4. Run `mvn spring-boot:run`.
5. Wait until the terminal says the application has started.
6. Open `http://localhost:8080/` in your browser.

If port 8080 is busy, change `server.port=8080` in `src/main/resources/application.properties` to `server.port=8082` and use `http://localhost:8082/`.

## Test the experiment
- Publish a normal event: it should be processed successfully.
- Publish the same successful event ID again: it should be marked as a duplicate.
- Enable **Simulate consumer failure**: the event is retried four times, waiting 1, 2, and 4 seconds between attempts, then recorded in the simulated DLQ.
- The activity panel refreshes automatically.

## What this demonstrates
- Exponential backoff retry
- Dead Letter Queue concept after retry exhaustion
- Idempotent handling of repeated event IDs

## Limitation
The queue and DLQ are in-memory simulation only. Data resets when the app restarts; there is no Kafka broker, durable queue, or cross-process delivery guarantee.
