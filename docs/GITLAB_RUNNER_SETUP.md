# GitLab Runner Setup Guide

This guide explains how to install and configure GitLab runners on a virtual machine to enable CI/CD pipeline execution.

## Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Root or sudo access
- Docker installed
- GitLab project with CI/CD enabled

## Installation Methods

### Method 1: Docker (Recommended)

This method runs the GitLab runner in a Docker container, which is the easiest and most portable approach.

#### Step 1: Install Docker

```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add current user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
newgrp docker
```

#### Step 2: Install GitLab Runner

```bash
# Download GitLab Runner
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash

# Install GitLab Runner
sudo apt-get install gitlab-runner
```

#### Step 3: Register the Runner

1. Get the registration token from GitLab:
   - Go to your GitLab project
   - Navigate to **Settings > CI/CD > Runners**
   - Copy the **Registration token**

2. Register the runner:

```bash
sudo gitlab-runner register
```

You'll be prompted for:
- **GitLab URL**: `https://gitlab.com/` (or your GitLab instance URL)
- **Registration token**: Paste the token from GitLab
- **Description**: `docker-runner` (or any description)
- **Tags**: `docker,linux` (optional, but useful for job targeting)
- **Executor**: `docker`
- **Default Docker image**: `docker:latest`

#### Step 4: Configure Runner for Docker-in-Docker

Edit the runner configuration:

```bash
sudo nano /etc/gitlab-runner/config.toml
```

Add or modify the runner configuration:

```toml
[[runners]]
  name = "docker-runner"
  url = "https://gitlab.com/"
  token = "YOUR_RUNNER_TOKEN"
  executor = "docker"
  [runners.docker]
    image = "docker:latest"
    privileged = true
    volumes = ["/certs/client", "/cache"]
    shm_size = 0
```

Restart the runner:

```bash
sudo gitlab-runner restart
```

### Method 2: Binary Installation

For systems where Docker is not available or preferred.

#### Step 1: Download GitLab Runner

```bash
# Download the binary for Linux amd64
sudo curl -L --output /usr/local/bin/gitlab-runner https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-linux-amd64

# Make it executable
sudo chmod +x /usr/local/bin/gitlab-runner

# Create GitLab Runner user
sudo useradd --comment 'GitLab Runner' --create-home gitlab-runner --shell /bin/bash

# Install and run as service
sudo gitlab-runner install --user=gitlab-runner --working-directory=/home/gitlab-runner
sudo gitlab-runner start
```

#### Step 2: Register the Runner

```bash
sudo gitlab-runner register
```

Follow the same prompts as in Method 1, but choose `shell` as the executor if Docker is not available.

## Verification

### Check Runner Status

```bash
# Check if runner is running
sudo gitlab-runner status

# List registered runners
sudo gitlab-runner list

# Verify runner is connected
sudo gitlab-runner verify
```

### Test Pipeline Execution

1. Go to your GitLab project
2. Navigate to **CI/CD > Pipelines**
3. Create a test commit or trigger a pipeline
4. Check if the runner picks up the job

## Configuration for AWS EC2 Deployment

If your runner needs to deploy to AWS EC2, ensure:

1. **SSH Access**: Runner has SSH keys configured
2. **Docker on EC2**: EC2 instance has Docker installed
3. **Network Access**: Runner can reach EC2 instance
4. **GitLab Variables**: All required variables are set

### SSH Key Setup

```bash
# Generate SSH key pair (if not exists)
ssh-keygen -t rsa -b 4096 -C "gitlab-runner@example.com"

# Copy public key to EC2
ssh-copy-id -i ~/.ssh/id_rsa.pub user@ec2-instance

# Test connection
ssh user@ec2-instance "docker ps"
```

## Runner Tags and Job Targeting

### Using Tags

In `.gitlab-ci.yml`, you can specify which runner to use:

```yaml
build:backend:
  tags:
    - docker
    - linux
```

### Multiple Runners

You can register multiple runners with different tags:

```bash
# Register runner for backend builds
sudo gitlab-runner register --tag-list "backend,docker"

# Register runner for frontend builds
sudo gitlab-runner register --tag-list "frontend,docker"
```

## Troubleshooting

### Runner Not Picking Up Jobs

1. **Check runner status**:
   ```bash
   sudo gitlab-runner status
   ```

2. **Check runner logs**:
   ```bash
   sudo gitlab-runner --debug run
   ```

3. **Verify runner is active in GitLab**:
   - Go to **Settings > CI/CD > Runners**
   - Ensure runner shows as "Active"

### Docker-in-Docker Issues

If you encounter Docker-in-Docker issues:

1. **Enable privileged mode** in runner config
2. **Check Docker socket**:
   ```bash
   ls -la /var/run/docker.sock
   ```

3. **Restart Docker service**:
   ```bash
   sudo systemctl restart docker
   ```

### Permission Issues

```bash
# Fix permissions for Docker socket
sudo chmod 666 /var/run/docker.sock

# Or add gitlab-runner user to docker group
sudo usermod -aG docker gitlab-runner
```

## Security Best Practices

1. **Use specific tags**: Don't use shared runners for production
2. **Limit access**: Only register runners on trusted machines
3. **Regular updates**: Keep GitLab Runner updated
4. **Monitor logs**: Regularly check runner logs for issues
5. **Secure SSH**: Use key-based authentication only
6. **Firewall**: Restrict access to runner ports if exposed

## Maintenance

### Update GitLab Runner

```bash
# Stop runner
sudo gitlab-runner stop

# Download latest version
sudo curl -L --output /usr/local/bin/gitlab-runner https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-linux-amd64

# Make executable
sudo chmod +x /usr/local/bin/gitlab-runner

# Start runner
sudo gitlab-runner start
```

### Unregister Runner

```bash
# List runners
sudo gitlab-runner list

# Unregister specific runner
sudo gitlab-runner unregister --name "runner-name"
```

### View Runner Logs

```bash
# System logs
sudo journalctl -u gitlab-runner -f

# Runner logs
sudo tail -f /var/log/gitlab-runner.log
```

## Advanced Configuration

### Runner Concurrency

Edit `/etc/gitlab-runner/config.toml`:

```toml
concurrent = 4  # Number of jobs to run simultaneously
```

### Resource Limits

For Docker executor:

```toml
[runners.docker]
  memory = "2g"
  memory_swap = "4g"
  cpus = "2"
```

### Custom Docker Images

```toml
[runners.docker]
  image = "node:18-alpine"
  pull_policy = "if-not-present"
```

## Proof of Runner Connection

To demonstrate runner connection:

1. **Screenshot GitLab Runners page**:
   - Go to **Settings > CI/CD > Runners**
   - Show active runner with green status

2. **Run a simple test job**:
   Create a test pipeline:

```yaml
test:runner:
  script:
    - echo "Runner is connected and working!"
    - docker --version
    - docker-compose --version
```

3. **Check job logs**:
   - Verify job executes on your runner
   - Check output shows runner information

## Next Steps

- [ ] Set up multiple runners for different environments
- [ ] Configure runner autoscaling
- [ ] Set up monitoring for runners
- [ ] Document runner maintenance procedures

