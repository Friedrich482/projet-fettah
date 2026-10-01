const images = [
    {
        name: "web-pentest-basic",
        tag: "latest",
        description: "Basic environment for web penetration testing.",
        cpuOptions: [1, 2],
        ramOptions: [512, 1024, 2048],
        defaultCpu: 2,
        defaultRam: 2048
    }
];

async function getImages() {
    return images;
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

async function createReservationRequest(imageName, imageTag, machineCpu, machineRam, duration) {
    const response = await fetch("http://localhost:3040/reservations", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            imageName,
            imageTag,
            machineCpu,
            machineRam,
            duration
        })
    });

    if (!response.ok) {
        throw new Error("Failed to create reservation");
    }

    return response.json();
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