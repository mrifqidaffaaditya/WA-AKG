#!/bin/bash

API_KEY="wag_TESTAPIKEY123"
BASE_URL="https://wa-akg.aikeigroup.net/api"

echo "Testing APIs with Key: $API_KEY"

# 1. List Sessions
echo -e "\n1. GET /sessions"
curl -s -X GET "$BASE_URL/sessions" \
  -H "x-api-key: $API_KEY" | head -c 500
echo "..."

# 2. Create Session
echo -e "\n\n2. POST /sessions"
curl -s -X POST "$BASE_URL/sessions" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "API Test Session", "sessionId": "api-test-1"}' | head -c 500
echo "..."

# 3. List Groups (for api-test-1)
echo -e "\n\n3. GET /groups/api-test-1"
curl -s -X GET "$BASE_URL/groups/api-test-1" \
  -H "x-api-key: $API_KEY" | head -c 500
echo "..."

# 4. Create Auto Reply
echo -e "\n\n4. POST /autoreplies"
curl -s -X POST "$BASE_URL/autoreplies" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "api-test-1",
    "keyword": "ping",
    "response": "pong",
    "matchType": "EXACT"
  }' | head -c 500
echo "..."

# 5. Create Webhook
echo -e "\n\n5. POST /webhooks"
curl -s -X POST "$BASE_URL/webhooks" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Webhook",
    "url": "https://example.com/webhook",
    "events": ["message.upsert"]
  }' | head -c 500
echo "..."

# 6. Send Message (Dry run - won't actually send if session not connected to WA, but DB should accept it or error)
echo -e "\n\n6. POST /chat/send"
curl -s -X POST "$BASE_URL/chat/send" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "api-test-1",
    "jid": "62899999999@s.whatsapp.net",
    "message": { "text": "Hello from API test" }
  }' | head -c 500
echo "..."

echo -e "\n\nDone."
