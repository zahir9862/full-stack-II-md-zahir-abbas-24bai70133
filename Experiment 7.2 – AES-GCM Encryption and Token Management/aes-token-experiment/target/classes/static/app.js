let accessToken = sessionStorage.getItem("accessToken") || "";
let refreshToken = sessionStorage.getItem("refreshToken") || "";
let lastCredentialId = null;

const $ = id => document.getElementById(id);

function setMessage(id, text, error = false) {
    const el = $(id);
    el.textContent = text;
    el.style.color = error ? "#ff91a0" : "#79e8c1";
}

async function api(url, options = {}) {
    const headers = options.headers || {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
    const response = await fetch(url, {...options, headers});
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    if (!response.ok) throw new Error(typeof data === "string" ? data : JSON.stringify(data));
    return data;
}

async function login() {
    setMessage("loginMsg", "Generating secure token pair...");
    try {
        const data = await api("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                username: $("username").value.trim(),
                password: $("password").value
            })
        });
        accessToken = data.accessToken;
        refreshToken = data.refreshToken;
        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("refreshToken", refreshToken);

        $("dashboard").classList.remove("hidden");
        $("loginBtn").textContent = "Tokens Generated ✓";
        $("accessToken").textContent = accessToken;
        $("refreshToken").textContent = refreshToken;
        setMessage("loginMsg", "Login successful — access + refresh tokens generated.");
        window.scrollTo({top: document.getElementById("dashboard").offsetTop - 20, behavior:"smooth"});
    } catch (e) {
        setMessage("loginMsg", `Login failed: ${e.message}`, true);
    }
}

async function rotate() {
    try {
        const data = await fetch("/auth/refresh", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({refreshToken})
        });
        const result = await data.json();
        if (!data.ok) throw new Error(result.message || JSON.stringify(result));
        accessToken = result.accessToken;
        refreshToken = result.refreshToken;
        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("refreshToken", refreshToken);
        $("accessToken").textContent = accessToken;
        $("refreshToken").textContent = refreshToken;
        setMessage("tokenMsg", "Refresh successful — old refresh token is now invalid.");
    } catch(e) {
        setMessage("tokenMsg", `Refresh failed: ${e.message}`, true);
    }
}

async function revoke() {
    try {
        await fetch("/auth/revoke", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({refreshToken})
        });
        refreshToken = "";
        sessionStorage.removeItem("refreshToken");
        setMessage("tokenMsg", "Refresh token revoked. You can log in again.");
    } catch(e) {
        setMessage("tokenMsg", `Revoke failed: ${e.message}`, true);
    }
}

async function protectedCall() {
    try {
        const data = await api("/api/protected");
        $("apiOutput").textContent = JSON.stringify(data, null, 2);
    } catch(e) {
        $("apiOutput").textContent = `ERROR: ${e.message}`;
    }
}

async function publicCall() {
    try {
        const response = await fetch("/api/public");
        $("apiOutput").textContent = JSON.stringify(await response.json(), null, 2);
    } catch(e) {
        $("apiOutput").textContent = `ERROR: ${e.message}`;
    }
}

async function saveCredential() {
    try {
        const data = await api("/api/credentials", {
            method:"POST",
            body:JSON.stringify({
                provider:$("provider").value,
                accessToken:$("oauthAccess").value,
                refreshToken:$("oauthRefresh").value
            })
        });
        lastCredentialId = data.id;
        setMessage("credentialMsg", `Encrypted and stored successfully. Database ID: ${data.id}`);
    } catch(e) {
        setMessage("credentialMsg", `Storage failed: ${e.message}`, true);
    }
}

function logout() {
    accessToken = "";
    refreshToken = "";
    sessionStorage.clear();
    $("dashboard").classList.add("hidden");
    $("loginBtn").textContent = "Generate Tokens →";
    window.scrollTo({top:0, behavior:"smooth"});
}

document.querySelectorAll(".demo-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        $("username").value = btn.dataset.u;
        $("password").value = btn.dataset.p;
        login();
    });
});

$("loginBtn").addEventListener("click", login);
$("refreshBtn").addEventListener("click", rotate);
$("revokeBtn").addEventListener("click", revoke);
$("protectedBtn").addEventListener("click", protectedCall);
$("publicBtn").addEventListener("click", publicCall);
$("saveCredentialBtn").addEventListener("click", saveCredential);
$("logoutBtn").addEventListener("click", logout);

if (accessToken && refreshToken) {
    $("dashboard").classList.remove("hidden");
    $("accessToken").textContent = accessToken;
    $("refreshToken").textContent = refreshToken;
}
