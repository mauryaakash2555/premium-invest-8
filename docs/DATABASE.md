# Database (Audit Snapshot)

This project uses **two different database systems** in the repo:

1. **Supabase Postgres (current Next.js app)** — used for AI chat leads + conversations + events.
2. **MongoDB (legacy backend / contact system)** — used by `backend/server.py` (FastAPI) and `api/contact.js` (Vercel function).

---

## Supabase (Postgres)

**Where schema lives:** `supabase/schema.sql`

### Tables

#### `leads` table

**Purpose:** Store captured lead information from the AI chat.

**Columns:**
- **id** (`uuid`, primary key): Unique lead ID.
- **name** (`text`, nullable): Lead name.
- **email** (`text`, unique): Lead email (used for upsert).
- **phone** (`text`, nullable): Lead phone.
- **lead_score** (`integer`, default 0): Latest numeric score (0–100). (Also tracked in events as authoritative history.)
- **created_at** (`timestamptz`, default now): When the lead row was created.

**Relationships:**
- `conversations.lead_id` → `leads.id` (ON DELETE CASCADE)
- `events.lead_id` → `leads.id` (ON DELETE CASCADE)

**Indexes:**
- `idx_leads_created_at` on `created_at DESC`

**Sample data (fake):**
```json
{
  "id": "11111111-1111-1111-1111-111111111111",
  "name": "Raj Sharma",
  "email": "raj@example.com",
  "phone": "9999999999",
  "lead_score": 85,
  "created_at": "2025-12-30T10:00:00Z"
}
```

**Common queries:**

Get newest leads:
```sql
SELECT * FROM leads
ORDER BY created_at DESC
LIMIT 50;
```

Get HOT leads (score >= 80):
```sql
SELECT * FROM leads
WHERE lead_score >= 80
ORDER BY created_at DESC;
```

---

#### `conversations` table

**Purpose:** Store chat messages (user + bot) for each lead.

**Columns:**
- **id** (`uuid`, primary key)
- **lead_id** (`uuid`, foreign key → `leads.id`, nullable)
- **message** (`text`, nullable): Message text.
- **sender** (`text`): `"user"` or `"bot"` (check constraint).
- **created_at** (`timestamptz`, default now)

**Relationships:**
- Many conversations belong to one lead.

**Indexes:**
- `idx_conversations_lead_created` on `(lead_id, created_at DESC)`

**Sample data (fake):**
```json
{
  "id": "22222222-2222-2222-2222-222222222222",
  "lead_id": "11111111-1111-1111-1111-111111111111",
  "sender": "user",
  "message": "How does SIP work?",
  "created_at": "2025-12-30T10:02:00Z"
}
```

**Common queries:**

Get a lead’s full conversation (oldest → newest):
```sql
SELECT * FROM conversations
WHERE lead_id = '11111111-1111-1111-1111-111111111111'
ORDER BY created_at ASC;
```

Count messages per lead:
```sql
SELECT lead_id, COUNT(*) AS messages
FROM conversations
GROUP BY lead_id
ORDER BY messages DESC;
```

---

#### `events` table

**Purpose:** Store analytics and “audit trail” events (visitor/message counts, lead scoring history, AI provider usage, revenue, admin strategy cache, errors).

**Columns:**
- **id** (`uuid`, primary key)
- **lead_id** (`uuid`, foreign key → `leads.id`, nullable)
- **event_type** (`text`)
- **data** (`jsonb`, nullable)
- **created_at** (`timestamptz`, default now)

**Indexes:**
- `idx_events_lead_created` on `(lead_id, created_at DESC)`

**Sample data (fake):**
```json
{
  "id": "33333333-3333-3333-3333-333333333333",
  "lead_id": "11111111-1111-1111-1111-111111111111",
  "event_type": "chat_ai",
  "data": { "provider": "groq", "conversationId": "abc123", "mode": "user" },
  "created_at": "2025-12-30T10:03:00Z"
}
```

**Common queries:**

Get today’s visitor events:
```sql
SELECT * FROM events
WHERE event_type = 'visitor'
  AND created_at >= CURRENT_DATE
ORDER BY created_at DESC;
```

Get latest lead score per lead (events-based):
```sql
SELECT DISTINCT ON (lead_id)
  lead_id, data, created_at
FROM events
WHERE event_type = 'lead_score'
ORDER BY lead_id, created_at DESC;
```

---

## MongoDB (legacy backend)

There is a MongoDB dump under:
- `database_backup/test_database/*.bson`

And Mongo is used by:
- `backend/server.py` (FastAPI + Motor)
- `api/contact.js` (Vercel serverless function)

### Collections (from backup metadata + backend code)

#### `contacts` collection

**Purpose:** Store contact form submissions.

**Fields (from `backend/server.py` model):**
- `id` (string uuid)
- `name` (string)
- `email` (string)
- `phone` (string)
- `message` (string)
- `timestamp` (ISO string)

**Fields (from `api/contact.js` Vercel function):**
- `name`, `email`, `phone`, `message`
- `submitted_at` (Date)
- `source` (string, example: `website_contact_form`)

**Indexes (from `contacts.metadata.json`):**
- `_id_`
- `timestamp_-1`

---

#### `newsletter` collection

**Purpose:** Store newsletter subscribers.

**Fields (from `backend/server.py` model):**
- `id` (string uuid)
- `email` (string)
- `timestamp` (ISO string)

**Indexes (from `newsletter.metadata.json`):**
- `_id_`
- `email_1` (unique)
- `timestamp_-1`

---

#### `blog_posts` collection

**Purpose:** Store blog posts in MongoDB (legacy backend).

**Fields (from `backend/server.py` model):**
- `id` (string uuid)
- `title` (string)
- `excerpt` (string)
- `content` (string, HTML)
- `author` (string)
- `category` (string)
- `image_url` (string, optional)
- `published_date` (ISO string)
- `slug` (string, optional)
- `tags` (array of strings, optional)
- `read_time` (string, optional)

**Indexes (from `blog_posts.metadata.json`):**
- `_id_`
- `id_1` (unique)
- `published_date_-1`

---

#### `status_checks` collection

**Purpose:** Unknown from backup alone (likely health/ops checks).

**Indexes (from `status_checks.metadata.json`):**
- `_id_`

**Fields:** Not fully known from the dump metadata (BSON content not described here).
