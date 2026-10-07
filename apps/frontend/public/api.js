const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;

async function handleApiError(response, fallbackMessage) {
    let message = fallbackMessage;

    try {
        const errorData = await response.json();
        if (errorData.message) {
            message = errorData.message;
        }
    } catch {
        // Keep fallback message if response has no JSON body.
    }

    const error = new Error(message);
    error.status = response.status;

    throw error;
}

async function getImages() {
    const response = await fetch(`${API_BASE_URL}/images`, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        await handleApiError(response, "Failed to load images");
    }

    return response.json();
}

async function getMachines() {
    const response = await fetch(`${API_BASE_URL}/machines`, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        await handleApiError(response, "Failed to load machines");
    }

    return response.json();
}

async function startMachineRequest(id) {
    const response = await fetch(`${API_BASE_URL}/machines/${id}/start`,
        {
            method: "POST",
            credentials: "include"
        }
    );

    if (!response.ok) {
        await handleApiError(response, "Failed to start machine");
    }

    return response.json();
}

async function stopMachineRequest(id) {
    const response = await fetch(`${API_BASE_URL}/machines/${id}/stop`,
        {
            method: "POST",
            credentials: "include"
        }
    );

    if (!response.ok) {
        await handleApiError(response, "Failed to stop machine");
    }

    return response.json();
}

async function connectMachineRequest(id) {
    const response = await fetch(`${API_BASE_URL}/machines/${id}/connect`, {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) {
        await handleApiError(response, "Failed to retrieve machine connection details");
    }

    return response.json();
}

async function getReservations() {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        await handleApiError(response, "Failed to load reservations");
    }
    
    return response.json();
}

async function createReservationRequest(imageName, imageTag, machineCpu, machineRam, duration) {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
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
        await handleApiError(response, "Failed to create reservation");
    }

    return response.json();
}

async function deleteReservationRequest(id) {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`,
        {
            method: "DELETE",
            credentials: "include"
        }
    );

    if (!response.ok) {
        await handleApiError(response, "Failed to release reservation");
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/sign-in/email`, {
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
    const response = await fetch(`${API_BASE_URL}/auth/sign-out`, {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Logout failed");
    }

    return response.json();
}

async function signup(name, email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/sign-up/email`, {
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
    const response = await fetch(`${API_BASE_URL}/auth/get-session`, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Failed to get session");
    }

    return response.json();
}