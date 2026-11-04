const API_BASE = "";

let selectedEndpoint = null;
let currentToken = null;
let toastTimer = null;


/* ================= ELEMENTS ================= */

const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");
const loginButton = document.getElementById("loginButton");
const loginButtonText = document.getElementById("loginButtonText");

const adminDemo = document.getElementById("adminDemo");
const userDemo = document.getElementById("userDemo");

const loginMessage = document.getElementById("loginMessage");

const logoutButton = document.getElementById("logoutButton");

const welcomeName = document.getElementById("welcomeName");
const sidebarName = document.getElementById("sidebarName");
const sidebarRole = document.getElementById("sidebarRole");

const roleValue = document.getElementById("roleValue");
const securityRole = document.getElementById("securityRole");

const tokenDisplay = document.getElementById("tokenDisplay");
const tokenUsername = document.getElementById("tokenUsername");
const tokenRole = document.getElementById("tokenRole");
const tokenAlgorithm = document.getElementById("tokenAlgorithm");

const pageTitle = document.getElementById("pageTitle");

const apiResponse = document.getElementById("apiResponse");
const responseStatus = document.getElementById("responseStatus");

const selectedEndpointElement =
    document.getElementById("selectedEndpoint");

const sendApiButton =
    document.getElementById("sendApiButton");

const apiModal =
    document.getElementById("apiModal");

const closeModal =
    document.getElementById("closeModal");

const modalOk =
    document.getElementById("modalOk");

const modalIcon =
    document.getElementById("modalIcon");

const modalTitle =
    document.getElementById("modalTitle");

const modalMessage =
    document.getElementById("modalMessage");

const modalStatus =
    document.getElementById("modalStatus");

const modalBody =
    document.getElementById("modalBody");

const toast =
    document.getElementById("toast");

const toastIcon =
    document.getElementById("toastIcon");

const toastTitle =
    document.getElementById("toastTitle");

const toastMessage =
    document.getElementById("toastMessage");


/* ================= LOGIN MESSAGE ================= */

function showLoginMessage(message, type = "error") {

    loginMessage.textContent = message;

    loginMessage.className =
        `message ${type}`;
}


function hideLoginMessage() {

    loginMessage.textContent = "";

    loginMessage.className =
        "message hidden";
}


/* ================= LOADING ================= */

function setLoginLoading(loading) {

    loginButton.disabled = loading;

    if (loading) {

        loginButtonText.textContent =
            "Authenticating...";

    } else {

        loginButtonText.textContent =
            "Login Securely";

    }
}


/* ================= TOAST ================= */

function showToast(title, message, success = true) {

    clearTimeout(toastTimer);

    toastTitle.textContent = title;

    toastMessage.textContent = message;

    toastIcon.textContent =
        success ? "✓" : "!";

    toastIcon.style.color =
        success
            ? "var(--green)"
            : "var(--red)";

    toast.classList.remove("hidden");

    toastTimer = setTimeout(() => {

        toast.classList.add("hidden");

    }, 3500);
}


/* ================= JWT DECODER ================= */

function decodeJwt(token) {

    try {

        const parts = token.split(".");

        if (parts.length !== 3) {

            return null;

        }

        const base64 = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const decoded = decodeURIComponent(
            atob(base64)
                .split("")
                .map(character =>
                    "%" +
                    (
                        "00" +
                        character
                            .charCodeAt(0)
                            .toString(16)
                    ).slice(-2)
                )
                .join("")
        );

        return JSON.parse(decoded);

    } catch (error) {

        console.error(
            "JWT decode error:",
            error
        );

        return null;

    }
}


/* ================= LOGIN ================= */

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        hideLoginMessage();

        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;

        if (!username || !password) {

            showLoginMessage(
                "Please enter both username and password."
            );

            return;
        }

        setLoginLoading(true);

        try {

            const response =
                await fetch(
                    `${API_BASE}/auth/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            username: username,
                            password: password
                        })
                    }
                );


            let data = {};

            try {

                data =
                    await response.json();

            } catch {

                data = {};

            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    `Login failed. HTTP ${response.status}`
                );

            }


            if (!data.token) {

                throw new Error(
                    "Login succeeded, but no JWT token was returned."
                );

            }


            currentToken =
                data.token;

            sessionStorage.setItem(
                "jwtToken",
                currentToken
            );


            openDashboard(
                currentToken,
                username
            );


            showToast(
                "Authentication successful",
                "JWT token generated successfully.",
                true
            );


        } catch (error) {

            console.error(error);

            showLoginMessage(
                error.message ||
                "Unable to connect to the Spring Boot server."
            );

        } finally {

            setLoginLoading(false);

        }

    }
);


/* ================= DEMO LOGIN ================= */

adminDemo.addEventListener(
    "click",
    function () {

        usernameInput.value =
            "admin";

        passwordInput.value =
            "admin123";

        hideLoginMessage();

        usernameInput.focus();

    }
);


userDemo.addEventListener(
    "click",
    function () {

        usernameInput.value =
            "user";

        passwordInput.value =
            "user123";

        hideLoginMessage();

        usernameInput.focus();

    }
);


/* ================= PASSWORD SHOW/HIDE ================= */

togglePassword.addEventListener(
    "click",
    function () {

        if (
            passwordInput.type ===
            "password"
        ) {

            passwordInput.type =
                "text";

            togglePassword.textContent =
                "🙈";

        } else {

            passwordInput.type =
                "password";

            togglePassword.textContent =
                "👁";

        }

    }
);


/* ================= OPEN DASHBOARD ================= */

function openDashboard(
    token,
    loginUsername = ""
) {

    const payload =
        decodeJwt(token);

    let username =
        loginUsername || "user";

    let role =
        "USER";

    let algorithm =
        "JWT";


    if (payload) {

        username =
            payload.sub ||
            payload.username ||
            username;

        role =
            payload.role ||
            payload.roles ||
            role;

        algorithm =
            payload.alg ||
            algorithm;

    }


    if (Array.isArray(role)) {

        role = role[0];

    }


    role =
        String(role)
            .replace("ROLE_", "")
            .toUpperCase();


    currentToken =
        token;


    /* ================= PERSONAL DETAILS ================= */

    /*
       For your project:
       Admin dashboard = Md Zahir Abbas
       UID = 24BAI70133

       The backend still authenticates using
       admin/admin123 and user/user123.
    */

    if (username === "admin") {

        welcomeName.textContent =
            "Md Zahir Abbas";

        sidebarName.textContent =
            "Md Zahir Abbas";

    } else {

        welcomeName.textContent =
            username;

        sidebarName.textContent =
            username;

    }


    sidebarRole.textContent =
        `ROLE: ${role}`;


    roleValue.textContent =
        role;


    securityRole.textContent =
        `ROLE_${role}`;


    tokenUsername.textContent =
        username;


    tokenRole.textContent =
        role;


    tokenAlgorithm.textContent =
        algorithm;


    tokenDisplay.textContent =
        token;


    /* ================= SHOW DASHBOARD ================= */

    loginPage.classList.add(
        "hidden"
    );

    dashboardPage.classList.remove(
        "hidden"
    );


    showSection("overview");
}


/* ================= NAVIGATION ================= */

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );


const dashboardSections = {

    overview:
        document.getElementById(
            "overviewSection"
        ),

    api:
        document.getElementById(
            "apiSection"
        ),

    security:
        document.getElementById(
            "securitySection"
        ),

    token:
        document.getElementById(
            "tokenSection"
        )

};


navItems.forEach(item => {

    item.addEventListener(
        "click",
        function () {

            showSection(
                item.dataset.section
            );

        }
    );

});


function showSection(sectionName) {

    Object.values(
        dashboardSections
    ).forEach(section => {

        section.classList.add(
            "hidden"
        );

    });


    if (
        dashboardSections[
            sectionName
        ]
    ) {

        dashboardSections[
            sectionName
        ].classList.remove(
            "hidden"
        );

    }


    navItems.forEach(item => {

        item.classList.remove(
            "active"
        );


        if (
            item.dataset.section ===
            sectionName
        ) {

            item.classList.add(
                "active"
            );

        }

    });


    const titles = {

        overview:
            "Security Overview",

        api:
            "API Testing",

        security:
            "Security & RBAC",

        token:
            "JWT Token"

    };


    pageTitle.textContent =
        titles[sectionName] ||
        "Security Dashboard";
}


/* ================= API CARDS ================= */

const apiCards =
    document.querySelectorAll(
        ".api-card"
    );


apiCards.forEach(card => {

    card.addEventListener(
        "click",
        function () {

            const endpoint =
                card.dataset.api;

            const name =
                card.dataset.name;


            showSection("api");


            selectEndpoint(
                endpoint,
                name
            );


            setTimeout(
                () => {
                    sendApiRequest();
                },
                150
            );

        }
    );

});


/* ================= ENDPOINT BUTTONS ================= */

const endpointButtons =
    document.querySelectorAll(
        ".endpoint-button"
    );


endpointButtons.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            const endpoint =
                button.dataset.api;

            const name =
                button.dataset.name;


            selectEndpoint(
                endpoint,
                name
            );

        }
    );

});


function selectEndpoint(
    endpoint,
    name
) {

    selectedEndpoint =
        endpoint;


    document
        .querySelectorAll(
            ".endpoint-button"
        )
        .forEach(button => {

            button.classList.remove(
                "selected"
            );


            if (
                button.dataset.api ===
                endpoint
            ) {

                button.classList.add(
                    "selected"
                );

            }

        });


    selectedEndpointElement.textContent =
        `${name}  •  ${endpoint}`;


    apiResponse.textContent =
        `Ready to send GET ${endpoint}`;


    responseStatus.textContent =
        "READY";


    responseStatus.className =
        "response-status";
}


/* ================= SEND API REQUEST ================= */

sendApiButton.addEventListener(
    "click",
    sendApiRequest
);


async function sendApiRequest() {

    if (!selectedEndpoint) {

        showToast(
            "No endpoint selected",
            "Choose an API endpoint first.",
            false
        );

        return;
    }


    if (!currentToken) {

        showToast(
            "Not authenticated",
            "Please login first.",
            false
        );

        return;
    }


    apiResponse.textContent =
        "Sending request...\n\n" +
        `GET ${selectedEndpoint}`;


    responseStatus.textContent =
        "LOADING";


    responseStatus.className =
        "response-status";


    sendApiButton.disabled =
        true;


    try {

        const response =
            await fetch(
                `${API_BASE}${selectedEndpoint}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${currentToken}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const text =
            await response.text();


        let formattedResponse =
            text;


        try {

            formattedResponse =
                JSON.stringify(
                    JSON.parse(text),
                    null,
                    2
                );

        } catch {

            formattedResponse =
                text;

        }


        apiResponse.textContent =
            formattedResponse ||
            "(empty response)";


        responseStatus.textContent =
            `HTTP ${response.status}`;


        responseStatus.className =
            response.ok
                ? "response-status success"
                : "response-status error";


        showApiModal(
            response.status,
            formattedResponse ||
            "(empty response)"
        );


    } catch (error) {

        console.error(error);


        apiResponse.textContent =
            "Unable to connect to the backend.\n\n" +
            error.message;


        responseStatus.textContent =
            "CONNECTION ERROR";


        responseStatus.className =
            "response-status error";


        showToast(
            "Backend unavailable",
            "Make sure Spring Boot is running on port 8080.",
            false
        );

    } finally {

        sendApiButton.disabled =
            false;

    }
}


/* ================= API MODAL ================= */

function showApiModal(
    status,
    body
) {

    apiModal.classList.remove(
        "hidden"
    );


    if (
        status >= 200 &&
        status < 300
    ) {

        modalIcon.textContent =
            "✓";

        modalIcon.className =
            "modal-icon";

        modalTitle.textContent =
            "Request Successful";

        modalMessage.textContent =
            "The Spring Boot API accepted your request.";

        modalStatus.textContent =
            `HTTP ${status}`;

        modalStatus.style.color =
            "var(--green)";

    }

    else if (status === 401) {

        modalIcon.textContent =
            "🔐";

        modalIcon.className =
            "modal-icon error";

        modalTitle.textContent =
            "Authentication Required";

        modalMessage.textContent =
            "Valid authentication is required.";

        modalStatus.textContent =
            "HTTP 401 — UNAUTHORIZED";

        modalStatus.style.color =
            "var(--red)";

    }

    else if (status === 403) {

        modalIcon.textContent =
            "🔒";

        modalIcon.className =
            "modal-icon error";

        modalTitle.textContent =
            "Access Denied";

        modalMessage.textContent =
            "You are authenticated, but your role does not have permission.";

        modalStatus.textContent =
            "HTTP 403 — FORBIDDEN";

        modalStatus.style.color =
            "var(--red)";

    }

    else {

        modalIcon.textContent =
            "!";

        modalIcon.className =
            "modal-icon error";

        modalTitle.textContent =
            "Request Failed";

        modalMessage.textContent =
            "The server returned an error response.";

        modalStatus.textContent =
            `HTTP ${status}`;

        modalStatus.style.color =
            "var(--red)";

    }


    modalBody.textContent =
        body;
}


function closeApiModal() {

    apiModal.classList.add(
        "hidden"
    );

}


closeModal.addEventListener(
    "click",
    closeApiModal
);


modalOk.addEventListener(
    "click",
    closeApiModal
);


apiModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            apiModal
        ) {

            closeApiModal();

        }

    }
);


/* ================= LOGOUT ================= */

logoutButton.addEventListener(
    "click",
    function () {

        sessionStorage.removeItem(
            "jwtToken"
        );


        currentToken = null;

        selectedEndpoint = null;


        dashboardPage.classList.add(
            "hidden"
        );

        loginPage.classList.remove(
            "hidden"
        );


        usernameInput.value = "";

        passwordInput.value = "";


        tokenDisplay.textContent =
            "JWT token will appear here after login.";


        apiResponse.textContent =
            'Select an endpoint and click "Send Request".';


        responseStatus.textContent =
            "WAITING";


        responseStatus.className =
            "response-status";


        showToast(
            "Logged out",
            "Your authentication session has ended.",
            true
        );

    }
);


/* ================= RESTORE SESSION ================= */

function restoreSession() {

    const savedToken =
        sessionStorage.getItem(
            "jwtToken"
        );


    if (!savedToken) {

        return;

    }


    const payload =
        decodeJwt(savedToken);


    if (!payload) {

        sessionStorage.removeItem(
            "jwtToken"
        );

        return;

    }


    /* Check JWT expiration */

    if (payload.exp) {

        const now =
            Math.floor(
                Date.now() / 1000
            );


        if (
            payload.exp <= now
        ) {

            sessionStorage.removeItem(
                "jwtToken"
            );

            return;

        }

    }


    currentToken =
        savedToken;


    openDashboard(
        savedToken,
        payload.sub || "user"
    );

}


/* ================= ESCAPE KEY ================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            !apiModal.classList.contains(
                "hidden"
            )
        ) {

            closeApiModal();

        }

    }
);


/* ================= START APP ================= */

restoreSession();