# OpenClaw / n8n / Make API Spec (Auto Poster Bridge)

Base URL (local): `http://127.0.0.1:3721`

## Auth
Preferred:
- `X-API-Key: <API_KEY>`

Also supported:
- `Authorization: Bearer <API_KEY>`
- `?api_key=<API_KEY>` (for quick tests)

## Endpoint summary
- `GET /health`
- `GET /status`
- `POST /send`
- `POST /open`
- `POST /click`

Advanced (extension poller):
- `GET /v1/commands/next?clientId=...`
- `POST /v1/commands/:id/ack`
- `POST /v1/status`
- `GET /v1/status?clientId=...`

## /send actions
### start_posting
Use saved templates/groups OR send inline content.

**Saved objects**
```json
{
  "action": "start_posting",
  "payload": {
    "postIds": ["Promo Post"],
    "groupCollectionIds": ["Dubai Groups"],
    "postingMethod": "directApi",
    "settingsOverrides": {
      "timeDelay": 300,
      "groupNumberForDelay": 1,
      "postOrder": "sequential",
      "securityLevel": "2"
    }
  }
}
```

**Inline (no saved templates)**
```json
{
  "action": "start_posting",
  "payload": {
    "posts": [
      { "title": "Quick Post", "text": "<p>Hello world</p>" }
    ],
    "groupLinks": [
      ["Group A", "https://www.facebook.com/groups/123"],
      ["Group B", "https://www.facebook.com/groups/456"]
    ],
    "postingMethod": "directApi"
  }
}
```

### stop_posting
```json
{ "action": "stop_posting" }
```

### update_settings
```json
{
  "action": "update_settings",
  "payload": {
    "timeDelay": 300,
    "groupNumberForDelay": 1,
    "postOrder": "sequential",
    "securityLevel": "2",
    "postingMethod": "directApi",
    "generateAiVariations": false,
    "aiVariationCount": 2,
    "commentOption": "enable",
    "firstCommentText": "",
    "avoidNightTimePosting": false,
    "compressImages": true,
    "delayAfterFailure": false,
    "postAnonymously": false
  }
}
```

### get_status
```json
{ "action": "get_status" }
```

### list_templates
```json
{ "action": "list_templates" }
```

### list_groups
```json
{ "action": "list_groups" }
```

### upsert_template
```json
{
  "action": "upsert_template",
  "payload": {
    "title": "Promo Post",
    "text": "<p>Buy now!</p>",
    "color": "#18191A"
  }
}
```

### delete_template
```json
{
  "action": "delete_template",
  "payload": { "title": "Promo Post" }
}
```

### upsert_group_collection
```json
{
  "action": "upsert_group_collection",
  "payload": {
    "title": "Dubai Groups",
    "links": [
      ["Group A", "https://www.facebook.com/groups/123"],
      ["Group B", "https://www.facebook.com/groups/456"]
    ]
  }
}
```

### delete_group_collection
```json
{
  "action": "delete_group_collection",
  "payload": { "title": "Dubai Groups" }
}
```

### open
```json
{
  "action": "open",
  "payload": { "url": "https://www.facebook.com/groups/123", "active": true }
}
```

### click
```json
{
  "action": "click",
  "payload": { "selector": "button[aria-label=\"Post\"]" }
}
```

## Responses
All `/send` calls return:
```json
{ "id": "cmd_123", "status": "queued" }
```

Status results are delivered via:
- `/status` (simple)
- `/v1/status` (advanced)

## Notes for OpenClaw
- Use `start_posting` with inline `posts` + `groupLinks` if you don't want to manage saved data.
- Use `upsert_template` and `upsert_group_collection` if OpenClaw wants to manage saved data.

