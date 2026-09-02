SERVICE_URL="http://localhost:8080"
TOKEN="<secure-token>"
curl -s -H "x-aster-token: $TOKEN" -H "Content-Type: application/json" -d '{"sessionId":"local-demo","text":"Summarize the attached file.","files":[{"objectName":"uploads/example.txt","mimeType":"text/plain"}]}' "$SERVICE_URL/chat"
