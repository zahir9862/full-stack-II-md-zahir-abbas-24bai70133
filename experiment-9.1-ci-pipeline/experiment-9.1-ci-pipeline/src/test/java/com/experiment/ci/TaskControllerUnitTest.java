package com.experiment.ci;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TaskControllerUnitTest {
    @Test
    void taskRecordKeepsProvidedValues() {
        TaskController.Task task = new TaskController.Task(7L, "Compile app", "QUEUED");
        assertEquals(7L, task.id());
        assertEquals("Compile app", task.title());
        assertEquals("QUEUED", task.status());
    }
}
