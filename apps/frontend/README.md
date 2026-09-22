## Architecture

When a browser sends a GET request for the website, the reverse proxy (Traefik) forwards it to Nginx. Nginx will send over the index page and its dependencies as a response to Traefik, and Traefik will forward those back to the browser. All requests go through Traefik.