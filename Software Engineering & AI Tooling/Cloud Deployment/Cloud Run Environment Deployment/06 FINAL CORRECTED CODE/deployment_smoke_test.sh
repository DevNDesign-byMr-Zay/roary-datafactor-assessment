SERVICE_URL="https://service-xxxxx.us-central1.run.app"
TOKEN="<secure-token>"
curl -s -H "x-app-token: $TOKEN" "$SERVICE_URL/health"
curl -s -H "x-app-token: $TOKEN" -H "Content-Type: application/json" -d '{"sessionId":"smoke","text":"Say hi."}' "$SERVICE_URL/chat"
