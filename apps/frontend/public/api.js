const machines = [
    {
        id: 1,
        imageId: "01k6testwebpentest00000000",
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
    const response = await fetch("http://localhost:3040/reservations", {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Failed to load reservations");
    }
    
    return response.json();
}

async function createReservationRequest(imageId, duration) {
    const response = await fetch("http://localhost:3040/reservations", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            imageId,
            duration
        })
    });

    if (!response.ok) {
        throw new Error("Failed to create reservation");
    }

    return response.json();
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

async function login(email, password) {
    const response = await fetch("http://localhost:3040/auth/sign-in/email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    if (!response.ok) {
        throw new Error("Login failed");
    }

    return response.json();
}

async function logout() {
    const response = await fetch("http://localhost:3040/auth/sign-out", {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Logout failed");
    }

    return response.json();
}

async function signup(name, email, password) {
    const response = await fetch("http://localhost:3040/auth/sign-up/email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            name,
            email,
            password
        })
    });

    if (!response.ok) {
        throw new Error("Sign up failed");
    }

    return response.json();
}

async function getSession() {
    const response = await fetch("http://localhost:3040/auth/get-session", {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Failed to get session");
    }

    return response.json();
}