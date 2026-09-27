const machines = [
    {
        id: 1,
        name: "Web Pentest Basic",
        description: "Basic environment for web penetration testing.",
        image: "web-pentest-basic",
        cpuOptions: [1, 2],
        ramOptions: [512, 1024, 2048]
    },
    {
        id: 2,
        name: "Buffer Overflow 101",
        description: "Environment for practicing basic buffer overflow exploitation.",
        image: "buffer-overflow-101",
        cpuOptions: [1, 2],
        ramOptions: [512, 1024, 2048]
    }
];

const allowedDurations = [30, 60, 120, 180];

const reservations = [];

let nextReservationId = 1;

async function getMachines() {
    return machines;
}

async function getReservations() {
    return reservations;
}

function addReservation(machineId, duration, cpu, ram) {
    const machine = machines.find(machine => machine.id === machineId);

    if (!machine || !machine.cpuOptions.includes(cpu) || !machine.ramOptions.includes(ram) || !allowedDurations.includes(duration)) {
        return null;
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 1000 * 60);

    const newReservation = {
        id: nextReservationId++,
        machineId: machine.id,
        machineName: machine.name,
        machineImage: machine.image,
        status: "PENDING",
        resources: {
            cpu,
            ram
        },
        duration,
        startTime,
        endTime,
        worker: null,
        connection: null
    };

    reservations.push(newReservation);
    return newReservation;
}

function startReservation(id) {
    const reservation = reservations.find(reservation => reservation.id === id);

    if (!reservation || reservation.status === "EXPIRED") {
        return null;
    }

    reservation.status = "READY";
    reservation.connection = "192.168.1.100:8080";
    return reservation;
}

function stopReservation(id) {
    const reservation = reservations.find(reservation => reservation.id === id);

    if (!reservation || reservation.status === "EXPIRED") {
        return null;
    }

    reservation.status = "STOPPED";
    reservation.connection = null;
    return reservation;
}

function removeReservation(id) {
    const index = reservations.findIndex(reservation => reservation.id === id);

    if (index !== -1) {
        reservations.splice(index, 1);
    }
}