const $ = (id) => document.getElementById(id);

const makeId = (prefix = "post") =>
    `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

// Generate an initial event ID
$("eventId").value = makeId();

// Generate a new event ID
$("newId").addEventListener("click", () => {
    $("eventId").value = makeId();
});

// Load successful-event demo
$("successDemo").addEventListener("click", () => {
    $("eventId").value = makeId();
    $("postText").value =
        "A scheduled post is ready for reliable processing.";
    $("failure").checked = false;
});

// Load failure demo
$("failDemo").addEventListener("click", () => {
    $("eventId").value = makeId("fail");
    $("postText").value =
        "Intentional failure to demonstrate retries and the dead-letter queue.";
    $("failure").checked = true;
});

// Publish an event
$("form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const eventId = $("eventId").value.trim();
    const postText = $("postText").value.trim();
    const simulateFailure = $("failure").checked;

    const responseBox = $("response");
    const indicator = document.querySelector(".response-indicator");

    if (!eventId || !postText) {
        responseBox.textContent =
            "Please enter an event ID and payload.";
        return;
    }

    responseBox.textContent = "Publishing event...";
    indicator.style.background = "#e9ad4e";

    try {
        const response = await fetch("/api/events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                eventId: eventId,
                postText: postText,
                simulateFailure: simulateFailure
            })
        });

        const result = await response.json();

        responseBox.textContent = JSON.stringify(result, null, 2);
        indicator.style.background = response.ok
            ? "#20b383"
            : "#e36a73";

        if (response.ok) {
            await load();
        }
    } catch (error) {
        console.error("Publishing failed:", error);

        responseBox.textContent =
            "Backend unreachable. Make sure Spring Boot is running.";

        indicator.style.background = "#e36a73";
    }
});

// Escape text before inserting it into HTML
function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Show only final event statuses in the timeline
function renderActivity(items) {
    const activity = $("activity");

    const finalStatuses = [
        "PROCESSED",
        "SUCCESS",
        "DLQ",
        "DUPLICATE",
        "ERROR"
    ];

    const finalItems = (items || []).filter((item) =>
        finalStatuses.includes(String(item.status).toUpperCase())
    );

    if (finalItems.length === 0) {
        activity.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">↯</div>
                <b>No completed events yet</b>
                <p>Publish an event to see its final status here.</p>
            </div>
        `;
        return;
    }

    activity.innerHTML = finalItems.map((item) => `
        <div class="item">
            <div>
                <strong class="${esc(item.status)}">
                    ${esc(item.status)}
                </strong>
                <time>
                    ${item.time
                        ? new Date(item.time).toLocaleTimeString()
                        : "Just now"}
                </time>
            </div>
            <div>
                <b>${esc(item.eventId)}</b>
                <p>${esc(item.message)}</p>
            </div>
        </div>
    `).join("");
}

// Load activity from the backend
async function load() {
    try {
        const response = await fetch("/api/activity", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Activity request failed");
        }

        const data = await response.json();

        $("count").textContent = data.processedCount ?? 0;
        renderActivity(data.items ?? []);
    } catch (error) {
        $("activity").innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">!</div>
                <b>Backend not connected</b>
                <p>Start Spring Boot and refresh this panel.</p>
            </div>
        `;
    }
}

// Refresh button
$("refresh").addEventListener("click", load);

// Check backend status
async function checkHealth() {
    try {
        const response = await fetch("/api/health");
        const data = await response.json();

        document.querySelector(".local-tag").innerHTML =
            "<i></i> " +
            (data.mode?.includes("not used")
                ? "LOCAL SIMULATION"
                : "LOCAL ENVIRONMENT");
    } catch (error) {
        document.querySelector(".local-tag").innerHTML =
            "<i></i> WAITING FOR BACKEND";
    }
}

// Initialize dashboard
checkHealth();
load();

// Refresh the timeline every four seconds
setInterval(load, 4000);
