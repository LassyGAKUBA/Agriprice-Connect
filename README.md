System Architecture & Operations

AgriPrice Connect is built on a modern DevSecOps architecture that integrates security, automation, and cloud deployment. Every code change is automatically tested, scanned for vulnerabilities, containerized, and deployed to the cloud with minimal manual intervention.

1. High-Level Architecture

Frontend
A containerized Nginx server serving the HTML, CSS, and JavaScript web application. It is exposed on port 80 for public access.

Backend
A Node.js/Express API responsible for handling crop price logic, API endpoints, and communication with the database.

Database
A MongoDB container used for storing application data, running within the same Docker network for secure internal communication.

Containerization
All services (frontend, backend, and database) run as Docker containers orchestrated using Docker Compose.

Cloud Infrastructure
Provisioned on Microsoft Azure using Terraform:

Azure Virtual Machine (Linux)
Virtual Network (VNet)
Subnets and Network Security Groups (NSGs)

Security Configuration

Port 80: Open for web traffic
Port 22: Restricted SSH access
Port 5000: Used internally for backend API
2. The “Git-to-Production” Pipeline

Our pipeline follows a DevSecOps “Shift Left” approach, integrating security early in the development lifecycle.

Continuous Integration (CI)

Triggered on every Pull Request to the main branch.

Steps include:

Install dependencies
Run application tests
Build Docker images (frontend & backend)
Perform security scans:
Trivy → scans Docker images for vulnerabilities
tfsec → scans Terraform configurations for misconfigurations

Policy:

The pipeline continues but highlights CRITICAL vulnerabilities for review
Continuous Deployment (CD)

Triggered automatically when code is merged into main.

Pipeline flow:

Build production Docker images
Tag images with:
latest
unique commit SHA
Push images to private registry:
Azure Container Registry
Trigger deployment using Ansible
Automated Deployment with Ansible

Ansible connects to the Azure VM via SSH and performs:

Docker & Docker Compose installation 
Authentication with ACR
Pulling latest container images
Cleaning up old/stuck containers
Restarting services using Docker Compose

This ensures:

Zero manual deployment steps
Clean container lifecycle management
Consistent production environment
3. Container Lifecycle Management

To ensure stable deployments:

Old containers are stopped using docker compose down
Stale containers are forcefully removed to avoid naming conflicts
New containers are started using the latest images from ACR

This prevents common issues such as:

Container name conflicts
Stale deployments
Inconsistent runtime states
4. How to Deploy (Operations Guide)
Step 1: Provision Infrastructure

Navigate to the Terraform directory:

cd terraform
terraform init
terraform apply
Step 2: Configure the Server

Run the Ansible playbook:

ansible-playbook -i ansible/inventory.ini ansible/playbook.yml

This will:

Install Docker
Configure the environment
Deploy the application
Step 3: Trigger CI/CD Pipeline
Create a feature branch
Push code changes
Open a Pull Request → triggers CI scans
Merge into main → triggers full deployment
5. Key Features of the System
Fully automated CI/CD pipeline
Secure container-based deployment
Private container registry integration
Infrastructure as Code (Terraform)
Configuration management with Ansible
Built-in vulnerability scanning (Trivy & tfsec)
6. Summary

AgriPrice Connect implements a complete end-to-end DevSecOps pipeline, where:

Code → Tested → Scanned → Built → Stored → Deployed → Running

All without manual intervention.
