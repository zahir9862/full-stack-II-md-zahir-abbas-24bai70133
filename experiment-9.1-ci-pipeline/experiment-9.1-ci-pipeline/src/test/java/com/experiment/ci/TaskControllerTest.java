package com.experiment.ci;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    @BeforeEach
    void clearTasks() throws Exception {
        mvc.perform(delete("/api/tasks"));
    }

    @Test
    void createsTaskAndReturnsQueuedStatus() throws Exception {
        mvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(new TaskController.CreateTaskRequest("Test checkout"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test checkout"))
                .andExpect(jsonPath("$.status").value("QUEUED"));
    }

    @Test
    void rejectsBlankTaskTitle() throws Exception {
        mvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\" \"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listsTasks() throws Exception {
        mvc.perform(post("/api/tasks").contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"API test\"}"));
        mvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("API test"));
    }
}
