# Neutrino App

Neutrino Test is an AI-powered QA testing platform that automates end-to-end testing using simple, natural language commands.

[//]: # "[![Neutrino-test](https://github.com/user-attachments/assets/f1071c61-09e8-4e47-8e6e-5321727b9917)
](https://www.youtube.com/watch?v=VL6-dZdQI_M&t=371s)"

[![Neutrino-test](https://github.com/user-attachments/assets/f05f36f2-4d83-458d-ab2b-2026cf0863eb)](https://www.youtube.com/watch?v=VL6-dZdQI_M&t=371s)


## Architecture

<p align="center">
  <img
    src="https://github.com/user-attachments/assets/e7219565-663e-43e7-88a1-7be72878dc9f"
    alt="Untitled-2025-03-27-2041"
    width="600"
  />
</p>



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

CLAUDE_API_KEY
SUPABASE_URL
SUPABASE_KEY

```



### 2. Initialise Supabase DB

Apply the database schema  
   ```bash
   supabase db push --file packages/supabase/schema.sql
   ```
Create the storage bucket
   ```bash
   supabase storage bucket create browser-actions-bucket
   ```
Apply the bucket policy
   ```bash
   supabase db query < packages/supabase/bucketPolicy.sql
   ```



### 3. Start Minikube

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

### 4. Build the Neutrino Service

Navigate to the `/apps/neutrino` directory and build the Docker images using Docker Compose:

```bash

docker compose build

```

### 5. Run the Webapp

From the root of the repository, run the following command to start the webapp:

```bash

yarn workspace webapp dev

```

This command will launch the development server for the webapp
