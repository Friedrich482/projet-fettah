console.log("Lab Hacker frontend loaded");

function renderMachines(machines) {
    const container = document.getElementById("available-labs");
    container.innerHTML = "";

    machines.forEach((machine) => {
        container.innerHTML += `
            <article class="lab-card">
                <h3>${machine.name}</h3>
                <p>${machine.description}</p>
                <label>
                    CPU:
                    <select class="reservation-cpu">
                        ${machine.cpuOptions.map(cpu => `
                            <option value="${cpu}">${cpu} CPU</option>
                        `).join("")}
                    </select>
                </label>
                <label>
                    RAM:
                    <select class="reservation-ram">
                        ${machine.ramOptions.map(ram => `
                            <option value="${ram}">${ram} MB</option>
                        `).join("")}
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
                <button class="create-lab-btn" data-machine-id="${machine.id}">Reserve</button>
            </article>
        `;
    });

    document.querySelectorAll(".create-lab-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            const card = button.closest(".lab-card");
            const cpuSelect = card.querySelector(".reservation-cpu");
            const ramSelect = card.querySelector(".reservation-ram");
            const durationSelect = card.querySelector(".reservation-duration");

            const machineId = Number(button.dataset.machineId);
            const cpu = Number(cpuSelect.value);
            const ram = Number(ramSelect.value);
            const duration = Number(durationSelect.value);

            try {
                await createReservation(machineId, duration, cpu, ram);
            } catch (error) {
                console.error(error);
                alert("Failed to create reservation.");
            }
        });
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
            </article>
        `;
    });

    document.querySelectorAll(".start-reservation-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            try {
                await startReservationUI(Number(button.dataset.reservationId));
            } catch (error) {
                console.error(error);
                alert("Failed to start reservation.");
            }
        });
    });

    document.querySelectorAll(".stop-reservation-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            try {
                await stopReservationUI(Number(button.dataset.reservationId));
            } catch (error) {
                console.error(error);
                alert("Failed to stop reservation.");
            }
        });
    });

    document.querySelectorAll(".destroy-lab-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            try {
                await destroyReservation(Number(button.dataset.reservationId));
            } catch (error) {
                console.error(error);
                alert("Failed to release reservation.");
            }
        });
    });
}

async function createReservation(machineId, duration, cpu, ram) {
    const machine = machines.find(machine => machine.id === machineId);

    if (!machine || !machine.imageId) {
        throw new Error("No backend image linked to this lab");
    }

    await createReservationRequest(machine.imageId, duration);

    const currentReservations = await getReservations();
    renderReservations(currentReservations);
}

async function startReservationUI(id) {
    startReservation(id);
    renderReservations(await getReservations());
}

async function stopReservationUI(id) {
    stopReservation(id);
    renderReservations(await getReservations());
}

async function destroyReservation(id) {
    removeReservation(id);
    renderReservations(await getReservations());
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
        authMessage.textContent = "Logged in successfully.";
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
        await checkSession();
    } catch (error) {
        console.error(error);
        authMessage.textContent = "Logout failed.";
    }
});

async function checkSession() {
    const authMessage = document.getElementById("auth-message");

    try {
        const session = await getSession();

        if (session?.user) {
            authMessage.textContent = `Logged in as ${session.user.email}`;
        } else {
            authMessage.textContent = "Not logged in.";
        }
    } catch (error) {
        console.error(error);
        authMessage.textContent = "Failed to check session.";
    }
}

async function initializeApp() {
    const availableLabsContainer = document.getElementById("available-labs");
    const userLabsContainer = document.getElementById("user-labs");

    availableLabsContainer.innerHTML = "<p>Loading machines...</p>";
    userLabsContainer.innerHTML = "<p>Loading reservations...</p>";

    try {
        const machines = await getMachines();
        renderMachines(machines);
        
    } catch (error) {
        console.error(error);
        availableLabsContainer.innerHTML = "<p>Failed to load machines</p>";
    }

    try {
        const reservations = await getReservations();
        renderReservations(reservations);
    } catch (error) {
        console.error(error);
        userLabsContainer.innerHTML = "<p>Failed to load reservations</p>";
    }
}

initializeApp();
checkSession();

setInterval(async() => {
    const reservations = await getReservations();
    renderReservations(reservations);
}, 5000);