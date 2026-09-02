SERVICE_URL="http://localhost:8080"
curl -s "$SERVICE_URL/health"
curl -s -H "Content-Type: application/json" -d '{"sessionId":"smoke","text":"Say hi."}' "$SERVICE_URL/chat"
