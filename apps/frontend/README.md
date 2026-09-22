# Frontend

Web frontend for the Lab Hacker platform.

## Architecture

When a browser sends a GET request for the website, the reverse proxy (Traefik) forwards it to Nginx. Nginx serves the frontend files, and Traefik forwards the response back to the browser.

## Current implementation

The frontend currently provides:

- a list of available lab types;
- creation of mock lab instances;
- simulated PENDING -> RUNNING -> READY status changes;
- connection information for READY labs;
- destruction of mock labs.

Lab data and status transitions are currently simulated in JavaScript. They will be replaced by calls to the REST API once the corresponding API endpoints are available.

## Execution

Build the image:

```sh
docker build -t lab-hacker-frontend .
```

Run it:

```sh
docker run --rm -p 8080:80 lab-hacker-frontend
```

Then open:

http://localhost:8080