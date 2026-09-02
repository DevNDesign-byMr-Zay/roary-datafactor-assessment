SERVICE_URL="https://service-xxxxx.us-central1.run.app"
# Historical failure pattern: comma-delimited URL values passed directly to --update-env-vars.
gcloud run services update aster-service --region us-central1 --update-env-vars ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
