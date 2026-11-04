# Experiment 3.1.2 — Retry, DLQ & Idempotency Simulation

## Requirements
- JDK 17 or newer
- Maven 3.8+ (or use your IDE's Maven integration)

## Run in VS Code (Windows PowerShell)
1. Extract the ZIP.
2. In VS Code choose File → Open Folder and open the `experiment-3.1.2-retry-dlq-idempotency` folder (the one containing `pom.xml`).
3. Open Terminal → New Terminal.
4. Run:
   `mvn spring-boot:run`
5. Open http://localhost:8080/

If port 8080 is already in use, first check whether http://localhost:8080/ is already showing this app. Otherwise stop the old Spring Boot process or restart the computer, then run again.

## Suggested demo
1. Publish a successful event with ID `ORDER-1001`.
2. Publish it again to show idempotency (duplicate ignored).
3. Select “Always fail”, use ID `ORDER-1002`, max retries `3`, and publish.
4. Inspect the activity timeline and DLQ table.
5. Reset the experiment.

## Important implementation note
This project is a simulation of the requested mechanisms and deliberately does not require Kafka or Docker. Retry/backoff decisions are logged without real waiting so the UI responds immediately. Data is stored in memory and resets when the application restarts. If the instructor requires actual Kafka topics and a broker-backed DLQ, this simulation needs to be extended with Kafka and Docker.

## Mechanism notes
- Retry count is maximum *retries after the initial attempt*. For max retries = 3, the simulator logs 4 total attempts when every attempt fails.
- Backoff log sequence starts at 250 ms and doubles each retry.
- Idempotency is demonstrated using the event ID as a key for successfully processed events. Failed events are routed to the simulated DLQ.
