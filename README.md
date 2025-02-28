# Neutrino App

This repository contains the Neutrino application, which includes a webapp and a neutrino service. Follow the steps below to set up your development environment and run the app.


## Prerequisites

Make sure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/)

- [kubectl](https://kubernetes.io/docs/tasks/tools/)

- [Minikube](https://minikube.sigs.k8s.io/docs/start/)


## Setup Instructions

### 1. Configure the Webapp Environment

Navigate to the `/apps/webapp` directory and create an environment file (e.g., `.env`) with the following variables:

```env

# Env variables for the webapp (webapp currently uses the Claude API driver)

CLAUDE_API_KEY=your_claude_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here

```


### 2. Start Minikube

Start your local Kubernetes cluster with Minikube:

```bash

minikube start

```

Then, configure your Docker client to use the Minikube daemon:

```bash

eval $(minikube docker-env)

```

To verify that Docker is now using Minikube, run:

```bash

docker info | grep minikube

```


### 3. Build the Neutrino Service

Navigate to the `/apps/neutrino` directory and build the Docker images using Docker Compose:

```bash

docker compose build

```


### 4. Run the Webapp

From the root of the repository, run the following command to start the webapp:

```bash

yarn workspace webapp dev

```

This command will launch the development server for the webapp
