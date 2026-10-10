# Project Deployment STI 4A

This is the repository of the deployment project in DevSecOps, 4A STI

## Apps and packages
- api: the main api of the project, built using Nest.js, a Node.js framework
- cli: a Python application that interacts with the api to monitor and connect to containers 
- frontend: a HTML + Javascript +Nginx dashboard to monitor the containers, similarly to the api
- worker: another Nest.js app, but standalone

## Run the project
To run the project in one go we use Docker compose.
First clone the project : 
```bash
git clone https://github.com/Friedrich482/projet-fettah.git
```
and the `compose.staging.yaml` file. 
But we need to have some example environment variables files created to make it work.

- The root `.env` file that provides the necessary environment variables to build the image of the frontend
  ```bash
  #.env
  API_BASE_URL=http://localhost:3041
  ```
- The api `.env.staging` file with the following example values. The Better-Auth secret can be generated with `openssl rand -base64 32`
  ```bash
  # apps/api/.env.staging
  PORT=3040
  NODE_ENV=production
  SERVER_URL=http://localhost:3041
  DATABASE_URL=postgresql://postgres:postgres@staging-database:5432/projet-deploiement
  BETTER_AUTH_URL=http://localhost:3041
  BETTER_AUTH_SECRET=mtI7laZ6pzDB5ChXw0Z77qfKaNUaRYod
  REDIS_HOST_PASSWORD=password
  MACHINES_SSH_HOST_IP=127.0.0.1
  REDIS_PORT=6379
  REDIS_HOST=staging-redis
  WEB_APP_URL=http://localhost:5000
  ```
- The worker `.env.staging` file with the following example values

  ```bash
  # apps/worker/.env.staging
  NODE_ENV=production
  DATABASE_URL=postgresql://postgres:postgres@staging-database:5432/projet-deploiement
  REDIS_HOST=staging-redis
  REDIS_PORT=6379
  REDIS_HOST_PASSWORD=password
  WORKER_NAME=worker-1
  MACHINES_NETWORK=machines-staging-network
  MACHINES_SSH_HOST_IP=127.0.0.1
  DOCKER_SOCKET_PATH=/var/run/docker.sock
  ```
- The `.env.postgres` for the PostgreSQL database. **Here it is important that the username, password and database name match the ones in the DATABASE_URL used for both the api and the worker**
  ```bash
  # apps/api/.env.postgres
  POSTGRES_PASSWORD=postgres
  POSTGRES_USER=postgres
  POSTGRES_DB=projet-deploiement
  ```
- The `.env.redis` for the Redis database.
  ```bash
  # apps/api/.env.redis
  REDIS_HOST_PASSWORD=password
  ```
- The `.env.gateway` for the drizzle gateway studio (a UI to interact with the PostgreSQL database)
  ```bash
  # apps/api/.env.gateway
  MASTERPASS=password
  ```
Once those files have been created, build and start all the docker compose services with:

```bash
docker compose --progress=plain -f compose.staging.yaml up -d --remove-orphans --build
```
