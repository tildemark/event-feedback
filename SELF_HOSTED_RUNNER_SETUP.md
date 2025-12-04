# Self-Hosted GitHub Runner Setup

## Why Self-Hosted Runner?

Since your production server restricts SSH from external sources but allows LAN access (10.10.0.3), a self-hosted runner on your local network can deploy directly.

---

## Setup Instructions

### 1. Choose a Machine for the Runner

Options:
- **Your development machine** (E:\code\feedback) - Simplest, already has network access
- **Dedicated server on LAN** - Better for production use
- **Raspberry Pi or similar** - Lightweight option

Requirements:
- Network access to 10.10.0.3 (production server)
- Docker installed (optional, for containerized deployments)
- Git installed
- Internet access (to pull from GitHub)

---

### 2. Install GitHub Actions Runner

#### Option A: On Windows (Your Current Machine)

1. **Go to GitHub repository:**
   ```
   https://github.com/tildemark/event-feedback/settings/actions/runners/new
   ```

2. **Select Windows** and follow the instructions:
   ```powershell
   # Create a folder for the runner
   mkdir C:\actions-runner
   cd C:\actions-runner
   
   # Download the latest runner package
   Invoke-WebRequest -Uri https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-win-x64-2.311.0.zip -OutFile actions-runner-win-x64-2.311.0.zip
   
   # Extract the installer
   Add-Type -AssemblyName System.IO.Compression.FileSystem
   [System.IO.Compression.ZipFile]::ExtractToDirectory("$PWD/actions-runner-win-x64-2.311.0.zip", "$PWD")
   
   # Configure the runner
   .\config.cmd --url https://github.com/tildemark/event-feedback --token YOUR_TOKEN
   
   # Install as a Windows service (optional)
   .\svc.sh install
   .\svc.sh start
   ```

3. **Install sshpass for password authentication:**
   ```powershell
   # Using Chocolatey (install Chocolatey first if needed)
   choco install sshpass
   
   # Or use WSL (Windows Subsystem for Linux)
   wsl --install
   # Then inside WSL:
   sudo apt-get install sshpass
   ```

#### Option B: On Linux (Separate Server/Pi)

1. **Go to GitHub repository:**
   ```
   https://github.com/tildemark/event-feedback/settings/actions/runners/new
   ```

2. **Select Linux** and run:
   ```bash
   # Create a folder
   mkdir actions-runner && cd actions-runner
   
   # Download the latest runner package
   curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
   
   # Extract the installer
   tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
   
   # Configure
   ./config.sh --url https://github.com/tildemark/event-feedback --token YOUR_TOKEN
   
   # Install as a service
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

3. **Install dependencies:**
   ```bash
   sudo apt-get update
   sudo apt-get install -y sshpass git docker.io docker-compose
   ```

---

### 3. Configure GitHub Secrets

Set these secrets for the self-hosted runner:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `PROD_SERVER_LAN_IP` | `10.10.0.3` | Production server LAN IP |
| `PROD_SERVER_USER` | `your-username` | SSH username |
| `PROD_SERVER_PASSWORD` | `your-password` | SSH password |

Go to: `https://github.com/tildemark/event-feedback/settings/secrets/actions`

---

### 4. Test the Runner

1. **Verify runner is online:**
   - Go to: `https://github.com/tildemark/event-feedback/settings/actions/runners`
   - You should see your runner with a green "Idle" status

2. **Test SSH connection from runner machine:**
   ```bash
   ssh user@10.10.0.3
   # Should connect successfully
   ```

3. **Trigger deployment:**
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```
   
   Watch the workflow run at:
   `https://github.com/tildemark/event-feedback/actions`

---

### 5. Windows-Specific Setup (If Using Your Dev Machine)

Since you're on Windows, you have two approaches:

#### Approach A: Use WSL (Recommended)

1. **Install WSL:**
   ```powershell
   wsl --install
   ```

2. **Configure runner in WSL:**
   ```bash
   # Inside WSL
   cd ~
   mkdir actions-runner && cd actions-runner
   # Follow Linux setup above
   ```

3. **Update workflow to use bash:**
   The existing `.github/workflows/deploy-selfhosted.yml` should work in WSL.

#### Approach B: Use PowerShell

Create a PowerShell version of the deployment:

```powershell
# In your runner machine, create: deploy.ps1
param(
    [string]$Host = "10.10.0.3",
    [string]$User = $env:PROD_USER,
    [string]$Password = $env:PROD_PASSWORD
)

# Use plink (from PuTTY) for SSH with password
# Install: choco install putty

$commands = @"
cd /opt/christmas-feedback
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
sleep 10
docker exec christmas-feedback-app npx prisma migrate deploy
docker ps | grep christmas-feedback
"@

echo $Password | plink -ssh -l $User -pw $Password $Host $commands
```

---

## Alternative Options

### Option 1: Manual Deployment Script (Simplest)

Just run deployments manually from your dev machine:

```powershell
# deploy-manual.ps1
ssh user@10.10.0.3
cd /opt/christmas-feedback
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
docker exec christmas-feedback-app npx prisma migrate deploy
exit
```

### Option 2: Webhook + Local Server

Set up a local webhook server that:
1. Listens for GitHub webhook events
2. Pulls code when push detected
3. Deploys to 10.10.0.3

### Option 3: VPN to Production Network

If you have VPN access to the production network, configure GitHub Actions to connect via VPN first (complex setup).

---

## Recommended Approach

**For your setup (Windows dev machine), I recommend:**

1. **Use WSL** - Install Ubuntu on Windows
2. **Set up self-hosted runner in WSL** - Full Linux environment
3. **Use the `.github/workflows/deploy-selfhosted.yml`** - Already configured
4. **Test from WSL:** `ssh user@10.10.0.3` - Verify connectivity

**Advantages:**
- ✅ Automated deployments on push to main
- ✅ Works with your existing network restrictions
- ✅ No need to expose SSH externally
- ✅ Full GitHub Actions features

---

## Quick Start (Recommended Path)

```powershell
# 1. Install WSL
wsl --install

# 2. Restart computer, then open WSL (Ubuntu)

# 3. Inside WSL, install dependencies
sudo apt-get update
sudo apt-get install -y sshpass git curl

# 4. Create runner directory
mkdir ~/actions-runner && cd ~/actions-runner

# 5. Download runner (get latest URL from GitHub)
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# 6. Get token from GitHub and configure
# Go to: https://github.com/tildemark/event-feedback/settings/actions/runners/new
./config.sh --url https://github.com/tildemark/event-feedback --token YOUR_TOKEN_HERE

# 7. Start runner
./run.sh
# Or install as service:
sudo ./svc.sh install
sudo ./svc.sh start

# 8. Test SSH to production
ssh user@10.10.0.3
```

---

## Troubleshooting

### Runner not connecting
- Check internet connectivity
- Verify GitHub token is valid
- Ensure no firewall blocking GitHub

### SSH fails from runner
- Verify LAN connectivity: `ping 10.10.0.3`
- Check SSH port: `nc -zv 10.10.0.3 22`
- Test password auth: `sshpass -p 'password' ssh user@10.10.0.3`

### Workflow uses wrong runner
- Make sure only one workflow is enabled
- Rename old `deploy.yml` to `deploy.yml.disabled`

---

## Security Notes

- 🔒 Runner machine should be secure (it has access to production)
- 🔑 Use GitHub Secrets for passwords (never hardcode)
- 🔐 Consider SSH keys instead of passwords on LAN
- 📝 Monitor runner logs for suspicious activity
