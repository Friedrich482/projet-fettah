console.log("Lab Hacker frontend loaded");

function renderMachines(machines) {
    const container = document.getElementById("available-labs");
    container.innerHTML = "";

    machines.forEach((machine) => {
        container.innerHTML += `
            <article class="lab-card">
                <h3>${machine.name}</h3>
                <p>${machine.description}</p>
                <p>CPU: ${machine.cpu}</p>
                <p>RAM: ${machine.ram}</p>
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
        button.addEventListener("click", () => {
            const card = button.closest(".lab-card");
            const durationSelect = card.querySelector(".reservation-duration");

            const machineId = Number(button.dataset.machineId);
            const duration = Number(durationSelect.value);
            createReservation(machineId, duration);
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
        if (reservation.status !== "EXPIRED" && Date.now() >= reservation.endTime.getTime()) {
            reservation.status = "EXPIRED";
            reservation.connection = null;
        }

        let connectionInfo = "";

        if (reservation.connection) {
            connectionInfo = `
                <p>Connection: ${reservation.connection}</p>
            `;
        }

        const startTime = reservation.startTime.toLocaleString();
        const endTime = reservation.endTime.toLocaleString();
        const remainingMilliseconds = reservation.endTime - Date.now();
        const remainingMinutes = Math.max(0, Math.ceil(remainingMilliseconds / (60 * 1000)));

        container.innerHTML += `
            <article class="lab-card">
                <h3>${reservation.machineName}</h3>
                <p>Status: ${reservation.status}</p>
                <p>CPU: ${reservation.cpu}</p>
                <p>RAM: ${reservation.ram} MB</p>
                <p>Duration: ${reservation.duration} minutes</p>
                <p>Start: ${startTime}</p>
                <p>End: ${endTime}</p>
                <p>Remaining: ${remainingMinutes} minutes</p>
                ${connectionInfo}
                <button class="destroy-lab-btn" data-reservation-id="${reservation.id}">Release</button>
            </article>
        `;
    });

    document.querySelectorAll(".destroy-lab-btn").forEach((button) => {
        button.addEventListener("click", () => {
            destroyReservation(Number(button.dataset.reservationId));
        });
    });
}

async function createReservation(machineId, duration) {
    const newReservation = addReservation(machineId, duration);
    if (!newReservation) {
        return null;
    }

    renderReservations(await getReservations());

    const currentReservations = await getReservations();
    const createdReservation = currentReservations.find(reservation => reservation.id === newReservation.id);

    setTimeout(async () => {
        const currentReservations = await getReservations();
        if (!currentReservations.includes(createdReservation)) return;

        createdReservation.status = "RUNNING";
        renderReservations(currentReservations);
    }, 2000);

    setTimeout(async () => {
        const currentReservations = await getReservations();
        if (!currentReservations.includes(createdReservation)) return;

        createdReservation.status = "READY";
        createdReservation.connection = "192.168.1.100:8080";
        renderReservations(currentReservations);
    }, 5000);
}

async function destroyReservation(id) {
    removeReservation(id);
    renderReservations(await getReservations());
}

async function initializeApp() {
    const availableLabsContainer = document.getElementById("available-labs");
    const userLabsContainer = document.getElementById("user-labs");

    availableLabsContainer.innerHTML = "<p>Loading machines...</p>";
    userLabsContainer.innerHTML = "<p>Loading reservations...</p>";

    const machines = await getMachines();
    const reservations = await getReservations();

    renderMachines(machines);
    renderReservations(reservations);
}

initializeApp();

setInterval(async() => {
    const reservations = await getReservations();
    renderReservations(reservations);
}, 5000);