console.log("Lab Hacker frontend loaded");

let currentSession = null;

function renderImages(images) {
    const container = document.getElementById("available-labs");
    container.innerHTML = "";

    images.forEach((image) => {
        container.innerHTML += `
            <article class="lab-card">
                <h3>${image.name}</h3>
                <p>${image.description}</p>
                <p>Version: ${image.tag}</p>
                <p>Default CPU: ${image.defaultCpu}</p>
                <p>Default RAM: ${image.defaultRam} MB</p>
                <p>Exposed port: ${image.exposedPort}</p>

                <label>
                    CPU:
                    <select class="reservation-cpu">
                        <option value="${image.defaultCpu}">${image.defaultCpu} CPU</option>
                    </select>
                </label>

                <label>
                    RAM:
                    <select class="reservation-ram">
                        <option value="${image.defaultRam}">${image.defaultRam} MB</option>
                    </select>
                </label>

                <label>
                    Duration:
                    <select class="reservation-duration">
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                        <option value="180">3 hours</option>
                    </select>
                </label>

                <button class="create-lab-btn" data-image-name="${image.name}" data-image-tag="${image.tag}">Reserve</button>
            </article>
        `;
    });

    document.querySelectorAll(".create-lab-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            const card = button.closest(".lab-card");
            const cpuSelect = card.querySelector(".reservation-cpu");
            const ramSelect = card.querySelector(".reservation-ram");
            const durationSelect = card.querySelector(".reservation-duration");

            const imageName = button.dataset.imageName;
            const imageTag = button.dataset.imageTag;
            const cpu = Number(cpuSelect.value);
            const ram = Number(ramSelect.value);
            const duration = Number(durationSelect.value);

            try {
                const created = await createReservationRequest(imageName, imageTag, cpu, ram, duration);

                console.log("Created reservation: ", created.reservation);
                console.log("Created machine: ", created.machine);
                
                await refreshReservations();
                await refreshMachines();
            } catch (error) {
                console.error(error);
                alert(error.message);
            }
        });
    });

    updateAuthUI(currentSession);
}

function renderMachines(machinesToRender) {
    const container = document.getElementById("machine-list");

    container.innerHTML = "";

    if (machinesToRender.length === 0) {
        container.innerHTML = "<p>No machines found.</p>";
        return;
    }

    machinesToRender.forEach((machine) => {
        container.innerHTML += `
            <article class="lab-card">
                <h3>${machine.name}</h3>
                <p>Machine ID: ${machine.id}</p>
                <p>Status: ${machine.status}</p>
                <p>CPU: ${machine.cpu}</p>
                <p>RAM: ${machine.ram} MB</p>
            </article>
        `;
    });
}

function renderReservations(reservationsToRender) {
    const container = document.getElementById("user-labs");

    container.innerHTML = "";

    if (reservationsToRender.length === 0) {
        container.innerHTML = "<p>No active reservations.</p>";
        return;
    }

    reservationsToRender.forEach((reservation) => {
        const expiresAt = reservation.expiresAt
            ? new Date(reservation.expiresAt).toLocaleString()
            : "Not set yet";

        const endedAt = reservation.endedAt
            ? new Date(reservation.endedAt).toLocaleString()
            : "Not ended";

        container.innerHTML += `
            <article class="lab-card">
                <h3>Reservation</h3>
                <p>Reservation ID: ${reservation.id}</p>
                <p>Status: ${reservation.status}</p>
                <p>Duration: ${reservation.duration} minutes</p>
                <p>Expires at: ${expiresAt}</p>
                <p>Ended at: ${endedAt}</p>
                <button class="release-reservation-btn" data-reservation-id="${reservation.id}">Release</button>
            </article>
        `;
    });

    document.querySelectorAll(".release-reservation-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            const reservationId = button.dataset.reservationId;

            button.disabled = true;
            button.textContent = "Releasing...";

            try {
                await deleteReservationRequest(reservationId);
                const reservations = await getReservations();
                renderReservations(reservations);
            } catch (error) {
                console.error(error);
                alert(error.message);
                button.disabled = false;
                button.textContent = "Release";
            }
        });
    });
}

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const authMessage = document.getElementById("auth-message");

    authMessage.textContent = "Logging in...";

    try {
        await login(email, password);
        await checkSession();
        await refreshReservations();
        await refreshMachines();
        startReservationPolling();
        loginForm.reset();
    } catch (error) {
        console.error(error);
        authMessage.textContent = "Login failed.";
    }
});

const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const signupMessage = document.getElementById("signup-message");

    signupMessage.textContent = "Creating account...";

    try {
        await signup(name, email, password);
        const session = await checkSession();

        if (session?.user) {
            await refreshReservations();
            await refreshMachines();
            startReservationPolling();
        }
        
        signupMessage.textContent = "Account created successfully.";
        signupForm.reset();
    } catch (error) {
        console.error(error);
        signupMessage.textContent = "Sign up failed.";
    }
});

const logoutButton = document.getElementById("logout-button");

logoutButton.addEventListener("click", async () => {
    const authMessage = document.getElementById("auth-message");

    try {
        await logout();
        stopReservationPolling();
        document.getElementById("user-labs").innerHTML = "<p>Log in to view your reservations.</p>";
        document.getElementById("machine-list").innerHTML = "<p>Log in to view your machines.</p>";
        await checkSession();
    } catch (error) {
        console.error(error);
        authMessage.textContent = "Logout failed.";
    }
});

function updateAuthUI(session) {
    const loginForm = document.getElementById("login-form");
    const loginTitle = document.getElementById("login-title");
    const signupForm = document.getElementById("signup-form");
    const signupTitle = document.getElementById("signup-title");
    const logoutButton = document.getElementById("logout-button");
    const reserveButtons = document.querySelectorAll(".create-lab-btn");
    const isLoggedIn = Boolean(session?.user);

    loginForm.hidden = isLoggedIn;
    loginTitle.hidden = isLoggedIn;
    signupForm.hidden = isLoggedIn;
    signupTitle.hidden = isLoggedIn;
    logoutButton.hidden = !isLoggedIn;

    reserveButtons.forEach((button) => {
        button.disabled = !isLoggedIn;
    });
}

async function checkSession() {
    const authMessage = document.getElementById("auth-message");

    try {
        const session = await getSession();
        currentSession = session;

        if (session?.user) {
            authMessage.textContent = `Logged in as ${session.user.email}`;
        } else {
            authMessage.textContent = "Not logged in.";
        }

        updateAuthUI(session);
        return session;
    } catch (error) {
        console.error(error);
        authMessage.textContent = "Failed to check session.";
        currentSession = null;
        updateAuthUI(null);
        return null;
    }
}

let reservationPollingId = null;
let isRefreshingReservations = false;

async function refreshReservations() {
    if (isRefreshingReservations) {
        return;
    }

    isRefreshingReservations = true;
    const userLabsContainer = document.getElementById("user-labs");

    try {
        const reservations = await getReservations();
        renderReservations(reservations);
    } catch (error) {
        console.error("Failed to refresh reservations: ", error);

        if (error.status === 401 || error.status === 403) {
            currentSession = null;
            stopReservationPolling();
            updateAuthUI(null);

            document.getElementById("auth-message").textContent = "Your session has expired. Please log in again.";
            userLabsContainer.innerHTML = "<p>Log in to view your reservations.</p>";
            return;
        }

        userLabsContainer.innerHTML = "<p>Failed to refresh reservations.</p>";
    } finally {
        isRefreshingReservations = false;
    }
}

function stopReservationPolling() {
    if (reservationPollingId !== null) {
        clearInterval(reservationPollingId);
        reservationPollingId = null;
    }
}

function startReservationPolling() {
    stopReservationPolling();
    reservationPollingId = setInterval(() => {
        refreshReservations();
        refreshMachines();
    }, 5000);
}

let isRefreshingMachines = false;

async function refreshMachines() {
    if (isRefreshingMachines) {
        return;
    }

    isRefreshingMachines = true;
    const machineListContainer = document.getElementById("machine-list");

    try {
        const machines = await getMachines();
        renderMachines(machines);
    } catch (error) {
        console.error("Failed to refresh machines: ", error);

        if (error.status === 401 || error.status === 403) {
            currentSession = null;
            stopReservationPolling();
            updateAuthUI(null);

            document.getElementById("auth-message").textContent = "Your session has expired. Please log in again.";
            machineListContainer.innerHTML = "<p>Log in to view your machines.</p>";

            return;
        }

        machineListContainer.innerHTML = "<p>Failed to refresh machines.</p>";
    } finally {
        isRefreshingMachines = false;
    }
}

async function initializeApp() {
    const availableLabsContainer = document.getElementById("available-labs");
    const userLabsContainer = document.getElementById("user-labs");

    availableLabsContainer.innerHTML = "<p>Loading lab templates...</p>";
    userLabsContainer.innerHTML = "<p>Checking session...</p>";

    try {
        const images = await getImages();
        renderImages(images);
        
    } catch (error) {
        console.error(error);
        availableLabsContainer.innerHTML = "<p>Failed to load lab templates</p>";
    }

    const session = await checkSession();

    if (session?.user) {
        await refreshReservations();
        await refreshMachines();
        startReservationPolling();
    } else {
        userLabsContainer.innerHTML = "<p>Log in to view your reservations.</p>";
        document.getElementById("machine-list").innerHTML = "<p>Log in to view your machines.</p>";
    }
}

initializeApp();