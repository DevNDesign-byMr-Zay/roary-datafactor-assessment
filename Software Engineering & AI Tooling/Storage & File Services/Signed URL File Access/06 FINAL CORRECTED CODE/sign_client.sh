SERVICE_URL="http://localhost:8080"
TOKEN="<secure-token>"
OBJECT="uploads/example-file.txt"
curl -s -G -H "x-app-token: $TOKEN" --data-urlencode "object=$OBJECT" "$SERVICE_URL/sign"
