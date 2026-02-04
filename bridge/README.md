# Auto Poster Local API Bridge

A small local HTTP server that lets n8n / Make / scripts control the extension.

## Setup
1. Install deps:
   ```
   cd bridge
   npm install
   ```
2. Edit `bridge.config.json` and set a strong `apiKey`.
   - You can copy `bridge.config.example.json` → `bridge.config.json`
3. Start:
   ```
   npm start
   ```

Server listens on `http://127.0.0.1:3721` by default.

## Docker (optional)
```
cd bridge
docker compose up -d --build
```

## Cloud server (optional)
You can run the same bridge on a VPS or server.
Requirements:
- HTTPS recommended (public API key on HTTP is not safe)
- Open port (default 3721) or change `port` in config
- Update extension settings: `Base URL` → `https://your-domain:PORT`

## Auth
Preferred: header `x-api-key: <API_KEY>`

Also supported:
- `Authorization: Bearer <API_KEY>`
- `?api_key=<API_KEY>` (for quick tests)

## Endpoints
- `GET /health`
- `POST /v1/commands`
- `GET /v1/commands/next?clientId=...`
- `POST /v1/commands/:id/ack`
- `POST /v1/status`
- `GET /v1/status?clientId=...`

Simple aliases:
- `GET /status`
- `POST /send`
- `POST /click`
- `POST /open`

## Docs
- `OPENCLAW_API_SPEC.md`
- `N8N_MAKE_EXAMPLES.md`

## Actions (via /send or /v1/commands)
Control:
- `start_posting`
- `stop_posting`
- `update_settings`
- `get_status`

Templates:
- `list_templates`
- `upsert_template`
- `delete_template`

Groups:
- `list_groups`
- `upsert_group_collection`
- `delete_group_collection`

## Example
```bash
curl -X POST http://127.0.0.1:3721/v1/commands \
  -H "x-api-key: 9abc2df4f9e895350af7257c58a839003a29a5ef31ee3c4b" \
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

## Inline posting (no stored templates/groups)
```bash
curl -X POST http://127.0.0.1:3721/send \
  -H "x-api-key: 9abc2df4f9e895350af7257c58a839003a29a5ef31ee3c4b" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "start_posting",
    "payload": {
      "posts": [
        { "title": "My Post", "text": "<p>Hello world</p>" }
      ],
      "groupLinks": [
        ["Group A", "https://www.facebook.com/groups/123"],
        ["Group B", "https://www.facebook.com/groups/456"]
      ],
      "postingMethod": "directApi"
    }
  }'
```

## Upsert template
```bash
curl -X POST http://127.0.0.1:3721/send \
  -H "x-api-key: 9abc2df4f9e895350af7257c58a839003a29a5ef31ee3c4b" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "upsert_template",
    "payload": {
      "title": "Promo Post",
      "text": "<p>Buy now!</p>",
      "color": "#18191A"
    }
  }'
```

## Upsert group collection
```bash
curl -X POST http://127.0.0.1:3721/send \
  -H "x-api-key: 9abc2df4f9e895350af7257c58a839003a29a5ef31ee3c4b" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "upsert_group_collection",
    "payload": {
      "title": "Dubai Groups",
      "links": [
        ["Group A", "https://www.facebook.com/groups/123"],
        ["Group B", "https://www.facebook.com/groups/456"]
      ]
    }
  }'
```
