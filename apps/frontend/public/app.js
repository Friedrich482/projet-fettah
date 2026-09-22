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

function renderLabTypes() {
    const container = document.getElementById("available-labs");
    container.innerHTML = "";

    labTypes.forEach((labType) => {
        container.innerHTML += `
            <article class="lab-card">
                <h3>${labType.name}</h3>
                <p>${labType.description}</p>
                <button onclick="createLab('${labType.name}')">Create Lab</button>
            </article>
        `;
    });
}

function renderLabs() {
    const container = document.getElementById("my-labs");
    container.innerHTML = "";

    labs.forEach((lab) => {
        container.innerHTML += `
            <article class="lab-card">
                <h3>${lab.type}</h3>
                <p>Status: ${lab.status}</p>
                <p>Host: ${lab.host}</p>
                <p>Port: ${lab.port}</p>
                <button onclick="destroyLab(${lab.id})">Destroy Lab</button>
            </article>
        `;
    });
}

function createLab(type) {
    const newLab = {
            id: labs.length + 1,
            type: type,
            status: "PENDING",
            host: "-",
            port: "-"
        };

    labs.push(newLab);
    renderLabs();

    const createdLab = labs.find(lab => lab.id === newLab.id);
    setTimeout(() => {
        if (!labs.includes(createdLab)) return;

        createdLab.status = "RUNNING";
        renderLabs();
    }, 2000);

    setTimeout(() => {
        if (!labs.includes(createdLab)) return;

        createdLab.status = "READY";
        createdLab.host = "192.168.1.100";
        createdLab.port = 8080;
        renderLabs();
    }, 5000);
}

function destroyLab(id) {
    const index = labs.findIndex(lab => lab.id === id);

    if (index !== -1) {
        labs.splice(index, 1);
        renderLabs();
    }
}

renderLabTypes();
renderLabs();