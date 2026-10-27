# VeriAI — Production Cloud Deployment Guide

This guide outlines how to deploy the **VeriAI** Multi-Agent LLM Evaluation & Hallucination Detection Platform to public cloud hosting platforms.

---

## 🚀 Option 1: 1-Click Deployment on Render (Recommended & Free Tier)

Render provides free hosting for Python web services and automatically builds directly from your GitHub repository.

### Prerequisites:
1. Push your latest code changes to your GitHub repository:
   ```bash
   git add .
   git commit -m "chore: add license, agile documentation, and deployment configs"
   git push origin main
   ```

### Steps:
1. Log in to [Render.com](https://render.com).
2. Click **New +** in the top navigation and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your repo: `https://github.com/Rajan217/HALLUCINATION_INFOSYS_INTERN`.
4. Configure the Web Service settings:
   - **Name**: `veriai-eval-platform`
   - **Region**: Oregon (US West) or closest region
   - **Branch**: `main`
   - **Root Directory**: Leave blank (root of repo)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m app.main`
   - **Instance Type**: `Free`
5. Click **Create Web Service**.
6. Render will install dependencies, seed the knowledge base, and launch your application.
7. Your app will be live at: `https://veriai-eval-platform.onrender.com`.

---

## 🤗 Option 2: Deploy to Hugging Face Spaces (Ideal for AI/LLM Projects)

Hugging Face Spaces allows you to deploy containerized AI web apps for free with dedicated community visibility.

### Steps:
1. Go to [Hugging Face Spaces](https://huggingface.co/spaces) and click **Create new Space**.
2. Set Space Name: `veriai-hallucination-detector`.
3. Select **Space SDK**: **Docker** (Blank).
4. Choose Space Hardware: **CPU Basic (Free - 2 vCPU, 16 GB RAM)**.
5. Clone the space repository locally or set your GitHub repo as a remote:
   ```bash
   git remote add hf https://huggingface.co/spaces/<YOUR_HF_USERNAME>/veriai-hallucination-detector
   git push hf main
   ```
6. Hugging Face Spaces will build the included [`Dockerfile`](../Dockerfile) and expose port `8000` automatically.

---

## 🚂 Option 3: Deploy to Railway

Railway offers frictionless zero-configuration container and python deployment.

### Steps:
1. Go to [Railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select `Rajan217/HALLUCINATION_INFOSYS_INTERN`.
4. Railway will automatically detect the [`Procfile`](../Procfile) or [`Dockerfile`](../Dockerfile).
5. In project settings, generate a domain (e.g. `veriai.up.railway.app`).
6. Your live web dashboard will be accessible immediately.

---

## 🐳 Option 4: Deploy Locally or on Any VPS via Docker

You can run the production container on any server (AWS EC2, GCP Compute Engine, DigitalOcean Droplet, or local machine):

### Build and Run:
```bash
# 1. Build the Docker container image
docker build -t veriai-app .

# 2. Run the container mapping port 8000
docker run -d -p 8000:8000 --name veriai-container veriai-app

# 3. Verify health status
curl http://localhost:8000/api/v1/kb/stats
```

Access the dashboard at `http://localhost:8000`.

---

## 🔍 Post-Deployment Verification Checklist

Once deployed to your chosen platform, verify the following endpoints:

| Checkpoint | Target Endpoint | Expected Result |
|---|---|---|
| **Health & RAG Index** | `GET /api/v1/kb/stats` | JSON response with `status: "ready"` and `total_chunks >= 10`. |
| **Interactive Dashboard** | `GET /` | Returns the responsive single-page application UI. |
| **API Docs (Swagger)** | `GET /docs` | Displays complete OpenAPI documentation interface. |
| **Single Evaluation** | `POST /api/v1/evaluate` | Returns structured multi-agent verdict report. |
| **Batch CSV Upload** | `POST /api/v1/evaluate/batch` | Processes uploaded CSV and provides aggregate metrics. |
