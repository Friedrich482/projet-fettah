console.log("Lab Hacker frontend loaded");

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
                storeMachine(created.machine);
                renderMachines(getStoredMachines());

                const reservations = await getReservations();
                renderReservations(reservations);
            } catch (error) {
                console.error(error);
                alert(error.message);
            }
        });
    });
}

function renderMachines(machinesToRender) {
    const container = document.getElementById("machine-list");

    container.innerHTML = "";

    if (machinesToRender.length === 0) {
        container.innerHTML = "<p>No machines created during this session.</p>";
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
            </article>
        `;
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

    availableLabsContainer.innerHTML = "<p>Loading lab templates...</p>";
    userLabsContainer.innerHTML = "<p>Loading reservations...</p>";

    try {
        const images = await getImages();
        renderImages(images);
        
    } catch (error) {
        console.error(error);
        availableLabsContainer.innerHTML = "<p>Failed to load lab templates</p>";
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