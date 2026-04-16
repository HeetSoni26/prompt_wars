# CareerPilot AI — Google Cloud Run Zero-Config Deployer
# This script deploys your backend to promptwars-9eba9 project.

$PROJECT_ID = "promptwars-9eba9"
$REGION = "us-central1"
$SERVICE_NAME = "careerpilot-api"

Write-Host "🚀 Starting Deployment for CareerPilot AI..." -ForegroundColor Cyan

# 1. Set Project
Write-Host "📍 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# 2. Enable Services
Write-Host "🛠 Ensuring Cloud Run & Build APIs are enabled..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 3. Build Container
Write-Host "📦 Building and Pushing Docker Image (this takes 1-2 mins)..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME ./backend

# 4. Deploy to Cloud Run
Write-Host "☁️ Deploying to Google Cloud Run..."
gcloud run deploy $SERVICE_NAME `
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --port 8080 `
  --memory 512Mi `
  --set-env-vars "NODE_ENV=production,FRONTEND_URL=*" `
  --set-secrets "GEMINI_API_KEY=careerpilot-gemini-key:latest,FIREBASE_PROJECT_ID=careerpilot-firebase-project:latest,FIREBASE_CLIENT_EMAIL=careerpilot-firebase-email:latest,FIREBASE_PRIVATE_KEY=careerpilot-firebase-key:latest"

Write-Host "`n✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "--------------------------------------------------"
Write-Host "Your Live URL is the 'Service URL' shown above."
Write-Host "Post this URL in your Hack2Skill submission form!"
Write-Host "--------------------------------------------------"
