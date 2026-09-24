const machines = [
    {
        id: 1,
        name: "Web Pentest Basic",
        description: "Basic environment for web penetration testing.",
        image: "web-pentest-basic",
        cpu: 1,
        ram: 512
    },
    {
        id: 2,
        name: "Buffer Overflow 101",
        description: "Environment for practicing basic buffer overflow exploitation.",
        image: "buffer-overflow-101",
        cpu: 1,
        ram: 512
    }
];

const reservations = [];

let nextReservationId = 1;

async function getMachines() {
    return machines;
}

async function getReservations() {
    return reservations;
}

function addReservation(machineId, duration) {
    const machine = machines.find(machine => machine.id === machineId);
    if (!machine) {
        return null;
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 1000 * 60);

    const newReservation = {
        id: nextReservationId++,
        machineId: machine.id,
        machineName: machine.name,
        status: "PENDING",
        resources: {
            cpu: machine.cpu,
            ram: machine.ram
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

function removeReservation(id) {
    const index = reservations.findIndex(reservation => reservation.id === id);

    if (index !== -1) {
        reservations.splice(index, 1);
    }
}