console.log("Lab Hacker frontend loaded");

const labTypes = [
    {
        name: "Web Pentest Basic",
        description: "Basic environment for web penetration testing."
    },
    {
        name: "Buffer Overflow 101",
        description: "Environment for practicing basic buffer overflow exploitation."
    }
];

const labs = [];

let nextLabId = 1;

function getLabTypes() {
    return labTypes;
}

function getLabs() {
    return labs;
}

function renderLabTypes(types) {
    const container = document.getElementById("available-labs");
    container.innerHTML = "";

    types.forEach((labType) => {
        container.innerHTML += `
            <article class="lab-card">
                <h3>${labType.name}</h3>
                <p>${labType.description}</p>
                <button class="create-lab-btn" data-lab-type="${labType.name}">Create Lab</button>
            </article>
        `;
    });

    document.querySelectorAll(".create-lab-btn").forEach((button) => {
        button.addEventListener("click", () => {
            createLab(button.dataset.labType);
        });
    });
}

function renderLabs(labsToRender) {
    const container = document.getElementById("my-labs");
    container.innerHTML = "";

    if (labsToRender.length === 0) {
        container.innerHTML = "<p>No active labs.</p>";
        return;
    }

    labsToRender.forEach((lab) => {
        let connectionInfo = "";

        if (lab.status === "READY") {
            connectionInfo = `
                <p>Host: ${lab.host}</p>
                <p>Port: ${lab.port}</p>
            `;
        }

        container.innerHTML += `
            <article class="lab-card">
                <h3>${lab.type}</h3>
                <p>Status: ${lab.status}</p>
                ${connectionInfo}
                <button class="destroy-lab-btn" data-lab-id="${lab.id}">Destroy Lab</button>
            </article>
        `;
    });

    document.querySelectorAll(".destroy-lab-btn").forEach((button) => {
        button.addEventListener("click", () => {
            destroyLab(Number(button.dataset.labId));
        });
    });
}

function createLab(type) {
    const newLab = {
        id: nextLabId++,
        type,
        status: "PENDING",
        host: "-",
        port: "-"
    };

    labs.push(newLab);
    renderLabs(getLabs());

    const createdLab = labs.find(lab => lab.id === newLab.id);
    setTimeout(() => {
        if (!labs.includes(createdLab)) return;

        createdLab.status = "RUNNING";
        renderLabs(getLabs());
    }, 2000);

    setTimeout(() => {
        if (!labs.includes(createdLab)) return;

        createdLab.status = "READY";
        createdLab.host = "192.168.1.100";
        createdLab.port = 8080;
        renderLabs(getLabs());
    }, 5000);
}

function destroyLab(id) {
    const index = labs.findIndex(lab => lab.id === id);

    if (index !== -1) {
        labs.splice(index, 1);
        renderLabs(getLabs());
    }
}

renderLabTypes(getLabTypes());
renderLabs(getLabs());