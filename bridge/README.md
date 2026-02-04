# Auto Poster Local API Bridge

A small local HTTP server that lets n8n / Make / scripts control the extension.

## Setup
1. Install deps:
   ```
   cd bridge
   npm install
   ```
2. Edit `bridge.config.json` and set a strong `apiKey`.
3. Start:
   ```
   npm start
   ```

Server listens on `http://127.0.0.1:3721` by default.

## Auth
Send header: `x-api-key: <API_KEY>`

## Endpoints
- `GET /health`
- `POST /v1/commands`
- `GET /v1/commands/next?clientId=...`
- `POST /v1/commands/:id/ack`
- `POST /v1/status`
- `GET /v1/status?clientId=...`

## Example
```bash
curl -X POST http://127.0.0.1:3721/v1/commands \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "start_posting",
    "payload": {
      "postIds": ["My Template"],
      "groupCollectionIds": ["My Groups"],
      "postingMethod": "directApi",
      "settingsOverrides": { "timeDelay": 300 }
    }
  }'
```
