# Deploying Otis to Google Cloud Run

This guide outlines how to build and deploy the Otis travel planner to Google Cloud Run using the provided `Dockerfile`.

## 1. Prerequisites
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated.
- A Google Cloud Project with Billing enabled.
- Artifact Registry and Cloud Run APIs enabled.

## 2. Prepare Environment Variables
Next.js requires `NEXT_PUBLIC_` variables at **build time**. Other variables (secrets) should be provided at **runtime**.

### Build-time Variables (NEXT_PUBLIC_*)
You will pass these using `--build-arg` during the build process.

### Runtime Variables (Secrets)
Set these in the Cloud Run service configuration or via Secret Manager:
- `GOOGLE_MAPS_SERVER_KEY`
- `GOOGLE_GEMINI_API_KEY`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `TRAVELPAYOUTS_API_TOKEN`
- `UNSPLASH_ACCESS_KEY`

## 3. Build and Deploy

Run the following commands in your terminal:

```bash
# Set your project configuration
PROJECT_ID="your-project-id"
REGION="us-central1"
SERVICE_NAME="otis-planner"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Build the image with build args
docker build \
  --build-arg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..." \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY="..." \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..." \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="..." \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..." \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..." \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="..." \
  --build-arg NEXT_PUBLIC_APP_URL="https://your-app-domain.a.run.app" \
  -t $IMAGE_NAME .

# Push to Google Container Registry (or Artifact Registry)
docker push $IMAGE_NAME

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_GEMINI_API_KEY=...,GOOGLE_MAPS_SERVER_KEY=..."
```

## 4. Alternative: Cloud Build (Recommended)
You can build and deploy in one step using Cloud Build, which doesn't require Docker to be installed locally:

```bash
gcloud builds submit --tag $IMAGE_NAME .
```
