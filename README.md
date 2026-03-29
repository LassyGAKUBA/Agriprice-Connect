# System Architecture & Operations

AgriPrice Connect is built on a modern DevSecOps architecture that integrates security, automation, and cloud deployment. Every code change is automatically tested, scanned for vulnerabilities, containerized, and deployed to the cloud with minimal manual intervention.

---

## 1. High-Level Architecture

| Component | Description |
|---|---|
| **Frontend** | A containerized Nginx server serving the HTML, CSS, and JavaScript web application. Exposed on port 80 for public access. |
| **Backend** | A Node.js/Express API responsible for handling crop price logic, API endpoints, and communication with the database. |
| **Database** | A MongoDB container used for storing application data, running within the same Docker network for secure internal communication. |
| **Containerization** | All services (frontend, backend, and database) run as Docker containers orchestrated using Docker Compose. |
| **Cloud Infrastructure** | Provisioned on Microsoft Azure using Terraform. |

### Azure Resources
- Azure Virtual Machine (Linux)
- Virtual Network (VNet)
- Subnets and Network Security Groups (NSGs)

### Security Configuration

| Port | Purpose |
|---|---|
| **80** | Open for web traffic |
| **22** | Restricted SSH access |
| **5000** | Used internally for backend API |

---

## 2. The "Git-to-Production" Pipeline

Our pipeline follows a DevSecOps **"Shift Left"** approach, integrating security early in the development lifecycle.

### Continuous Integration (CI)

Triggered on every **Pull Request** to the `main` branch.

**Steps include:**
1. Install dependencies
2. Run application tests
3. Build Docker images (frontend & backend)
4. Perform security scans:
   - **Trivy** → scans Docker images for vulnerabilities
   - **tfsec** → scans Terraform configurations for misconfigurations

> **Policy:** The pipeline continues but highlights `CRITICAL` vulnerabilities for review.

---

### Continuous Deployment (CD)

Triggered automatically when code is **merged into** `main`.

**Pipeline flow:**
1. Build production Docker images
2. Tag images with:
   - `latest`
   - Unique commit SHA
3. Push images to private registry: **Azure Container Registry**
4. Trigger deployment using **Ansible**

---

### Automated Deployment with Ansible

Ansible connects to the Azure VM via SSH and performs:

- Docker & Docker Compose installation
- Authentication with ACR
- Pulling latest container images
- Cleaning up old/stuck containers
- Restarting services using Docker Compose

**This ensures:**
- ✅ Zero manual deployment steps
- ✅ Clean container lifecycle management
- ✅ Consistent production environment

---

## 3. Container Lifecycle Management

To ensure stable deployments:

1. Old containers are stopped using `docker compose down`
2. Stale containers are forcefully removed to avoid naming conflicts
3. New containers are started using the latest images from ACR

**This prevents common issues such as:**
- Container name conflicts
- Stale deployments
- Inconsistent runtime states

---

## 4. How to Deploy (Operations Guide)

### Step 1: Provision Infrastructure

Navigate to the Terraform directory:

```bash
cd terraform
terraform init
terraform apply
```

### Step 2: Configure the Server

Run the Ansible playbook:

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
```

This will:
- Install Docker
- Configure the environment
- Deploy the application

### Step 3: Trigger CI/CD Pipeline

1. Create a feature branch
2. Push code changes
3. Open a **Pull Request** → triggers CI scans
4. Merge into `main` → triggers full deployment

---

## 5. Key Features of the System

- ✅ Fully automated CI/CD pipeline
- ✅ Secure container-based deployment
- ✅ Private container registry integration
- ✅ Infrastructure as Code (Terraform)
- ✅ Configuration management with Ansible
- ✅ Built-in vulnerability scanning (Trivy & tfsec)

---

## 6. Live Application Links

| Service | URL |
|---|---|
| **Frontend** | [http://20.197.28.110:80/](http://20.197.28.110:80/) |
| **Backend API** | [http://20.197.28.110:5000/](http://20.197.28.110:5000/) |

---

## 7. Project Collaborators

| Name | Main Task |
|---|---|
| **Lassy Gakuba** | Infrastructure & Cloud Provisioning (Terraform/Azure) |
| **Irielle Irakoze** | CI/CD Pipeline & Security Scanning |
| **Louis Marie T. Tona** | Application Development (Frontend & Backend) |

---

## 8. Summary

AgriPrice Connect implements a complete end-to-end DevSecOps pipeline, where:

```
Code → Tested → Scanned → Built → Stored → Deployed → Running
```

> All without manual intervention.

---

## 9. Full Automation Demo

**Demo Video**: [Link](https://drive.google.com/file/d/1-lo4UCwmn2TZyBgezkJvCq7QCXEXB973/view?usp=sharing)
