SERVICE_URL="http://localhost:8080"
TOKEN="<secure-token>"
curl -s -H "x-app-token: $TOKEN" -F "file=@./sample.txt" "$SERVICE_URL/upload"
