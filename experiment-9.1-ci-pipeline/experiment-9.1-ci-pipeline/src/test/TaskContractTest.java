package com.experiment.ci;

import au.com.dius.pact.consumer.MockServer;
import au.com.dius.pact.consumer.dsl.PactDslWithProvider;
import au.com.dius.pact.consumer.junit5.PactConsumerTestExt;
import au.com.dius.pact.consumer.junit5.PactTestFor;
import au.com.dius.pact.core.model.RequestResponsePact;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(providerName = "TaskService", port = "0")
class TaskContractTest {

    @au.com.dius.pact.consumer.junit5.Pact(
            consumer = "TaskDashboard",
            provider = "TaskService"
    )
    public RequestResponsePact createTaskContract(
            PactDslWithProvider builder) {

        return builder
                .given("the task API is available")
                .uponReceiving("a request to list tasks")
                .path("/api/tasks")
                .method("GET")
                .willRespondWith()
                .status(200)
                .headers(Map.of("Content-Type", "application/json"))
                .body("[]")
                .toPact();
    }

    @Test
    void taskServiceReturnsTaskList(MockServer mockServer) throws Exception {

        HttpURLConnection connection =
                (HttpURLConnection) new URL(
                        mockServer.getUrl() + "/api/tasks"
                ).openConnection();

        connection.setRequestMethod("GET");

        assertEquals(200, connection.getResponseCode());

        connection.disconnect();
    }
}