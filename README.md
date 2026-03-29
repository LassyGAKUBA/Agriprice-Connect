System Architecture & Operations

AgriPrice Connect is built on a modern DevSecOps stack, ensuring that every code change is scanned for security before being automatically deployed to our Azure cloud infrastructure.

1. High-Level Architecture
Frontend: A containerized Nginx server hosting our HTML/CSS/JS web application.

Backend: A Node.js/Express API handling crop price logic and data retrieval.

Infrastructure: An Azure Virtual Machine provisioned via Terraform within a dedicated Virtual Network (VNet).

Security: Network Security Groups (NSG) restrict traffic to Port 80 (Web) and Port 22 (SSH from authorized IPs).

2. The "Git-to-Production" Pipeline
Our automation strategy follows a "Shift Left" security approach:

Continuous Integration (CI): * Triggered on every Pull Request to main.

Trivy scans our Docker images for OS-level vulnerabilities.

tfsec scans our Terraform files to ensure our Azure cloud configuration is secure.

The build fails if any CRITICAL vulnerabilities are detected.

Continuous Deployment (CD):

Triggered only upon a successful merge to the main branch.

The pipeline builds the production Docker images and pushes them to our Private Azure Container Registry (ACR).

Ansible is then triggered to SSH into the Azure VM, pull the latest images from the ACR, and restart the services using Docker Compose.

3. How to Deploy (Operations)
To replicate this environment:

Infrastructure: Navigate to /terraform and run terraform init followed by terraform apply.

Configuration: Use the /ansible playbook to install Docker on the target VM.

Application: Push code changes to a feature branch and open a PR to see the DevSecOps scans in action.