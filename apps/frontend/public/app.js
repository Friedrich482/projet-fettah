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
        if (reservation.status !== "EXPIRED" && Date.now() >= reservation.endTime.getTime()) {
            reservation.status = "EXPIRED";
            reservation.connection = null;
            reservation.worker = null;
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
        const workerInfo = reservation.worker ?? "Not assigned";

        let lifecycleControls = "";
        if (reservation.status === "READY") {
            lifecycleControls = `<button class="stop-reservation-btn" data-reservation-id="${reservation.id}">Stop</button>`;
        } else if (reservation.status === "STOPPED") {
            lifecycleControls = `<button class="start-reservation-btn" data-reservation-id="${reservation.id}">Start</button>`;
        }

        container.innerHTML += `
            <article class="lab-card">
                <h3>${reservation.machineName}</h3>
                <p>Reservation ID: ${reservation.id}</p>
                <p>Image: ${reservation.machineImage}</p>
                <p>Worker: ${workerInfo}</p>
                <p>Status: ${reservation.status}</p>
                <p>CPU: ${reservation.resources.cpu}</p>
                <p>RAM: ${reservation.resources.ram} MB</p>
                <p>Duration: ${reservation.duration} minutes</p>
                <p>Start: ${startTime}</p>
                <p>End: ${endTime}</p>
                <p>Remaining: ${remainingMinutes} minutes</p>
                ${connectionInfo}
                ${lifecycleControls}
                <button class="destroy-lab-btn" data-reservation-id="${reservation.id}">Release</button>
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
    const newReservation = addReservation(machineId, duration, cpu, ram);

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
        createdReservation.worker = "worker-1";
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

setInterval(async() => {
    const reservations = await getReservations();
    renderReservations(reservations);
}, 5000);