# n8n & Make Examples

## n8n (HTTP Request) - Start Posting
Method: POST
URL: http://127.0.0.1:3721/send
Headers:
- x-api-key: 9abc2df4f9e895350af7257c58a839003a29a5ef31ee3c4b
- Content-Type: application/json
Body (RAW JSON):
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

## n8n - Update Template
Method: POST
URL: http://127.0.0.1:3721/send
Headers:
- x-api-key: 9abc2df4f9e895350af7257c58a839003a29a5ef31ee3c4b
- Content-Type: application/json
Body:
{
  "action": "upsert_template",
  "payload": {
    "title": "Promo Post",
    "text": "<p>Buy now!</p>"
  }
}

## Make.com (HTTP module)
- Method: POST
- URL: http://127.0.0.1:3721/send
- Headers:
  - x-api-key: 9abc2df4f9e895350af7257c58a839003a29a5ef31ee3c4b
  - Content-Type: application/json
- Body type: Raw / JSON

Example body:
{
  "action": "start_posting",
  "payload": {
    "postIds": ["Promo Post"],
    "groupCollectionIds": ["Dubai Groups"],
    "postingMethod": "directApi"
  }
}

