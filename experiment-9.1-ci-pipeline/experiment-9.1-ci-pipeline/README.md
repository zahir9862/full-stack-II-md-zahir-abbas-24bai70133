# Experiment 9.1 — Continuous Integration Pipeline

A Spring Boot learning project with a distinct Pipeline Studio dashboard, REST endpoints, JUnit 5 tests, MockMvc integration tests, Pact test dependency, and a GitHub Actions workflow.

## Requirements
- JDK 17+
- Maven 3.8+
- VS Code (or another Java IDE)
- GitHub account for remote CI

## Run locally
From the folder containing `pom.xml`:
```powershell
mvn clean test
mvn spring-boot:run
```
Open http://localhost:8080/

## GitHub Actions
Push this folder to a GitHub repository. The workflow at `.github/workflows/ci.yml` runs `mvn --batch-mode clean verify` on pushes and pull requests.

## Testing scope
- `TaskControllerUnitTest`: unit-level record behavior.
- `TaskControllerTest`: Spring Boot + MockMvc API integration tests.
- Pact JUnit 5 dependency is included so a Pact contract test can be added for an agreed consumer/provider contract. This starter does not claim that a complete Pact interaction test is already configured.
- Testcontainers is not configured in this lightweight version. It can be added if the lab requires a real database or Kafka container.

## Important
The dashboard's "Run local checks" button is a visual demonstration only. The actual tests are executed by Maven (`mvn clean test`) and GitHub Actions. Tasks are stored in memory and reset when the application restarts.
