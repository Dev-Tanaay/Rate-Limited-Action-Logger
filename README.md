# Rate-Limited Action Logger (Redis + PostgreSQL)

> A high-performance backend system that demonstrates advanced usage of Redis and PostgreSQL to handle rate-limiting, real-time analytics, concurrency control, and event-driven patterns.

---

## Project Overview

This app allows users to perform actions through an API endpoint, but with built-in controls using Redis to:
- Rate limit user actions (Token Bucket + Fixed Window)
- Broadcast actions in real-time (Pub/Sub)
- Cache latest action for fast retrieval (Key-Value)
- Persist action data in PostgreSQL

---

## Real-life Applications

| Feature                      | Real-World Use Case                                                |
|-----------------------------|---------------------------------------------------------------------|
| **Rate Limiting**           | APIs like Twitter, GitHub limit requests per user                  |
| **Token Bucket Throttling** | Task scheduling like queueing video uploads                        |
| **Leaderboard**             | Gamification in apps like Duolingo, StackOverflow, fitness apps    |
| **Streams (XADD)**          | Event logs for analytics, audit trail (e.g., banking, health apps) |
| **Pub/Sub**                 | Real-time chat, notification systems                               |
| **Caching last action**     | Show "recent activity" instantly in user dashboards                |

---

## Tech Stack

- **Node.js + Express**
- **TypeScript**
- **Redis** (for rate limit, streams, pub/sub, caching)
- **PostgreSQL** with **Prisma ORM**
- **Optional**: Docker

---

## API Endpoints

### `POST /signin`
- Body: 
```json
{
  "userName": "Sample",
  "email": "sample@gmail.com",
  "password": "sample123",
}
```

### `POST /login`
- Authenticates user and returns JWT token (optional)
- Body: 
```json
{
  "email": "sample@gmail.com",
  "password": "sample123",
}
```

### `POST /action`
- Body: 
```json
{
  "type": "UPLOAD",
  "metaData": {"file": "invoice.pdf"}
}
```
- Does:
  - Checks rate limit (fixed + token bucket)
  - Stores action in PostgreSQL
  - Pushes to Redis Stream for audit
  - Publishes to Pub/Sub for subscribers
  - Increments user score in leaderboard
  - Caches last action for 5 minutes

---

## Redis Concepts Covered

| Concept             | Redis Feature Used           |
|---------------------|------------------------------|
| Rate Limiting       | `INCR`, `EXPIRE`, `TTL`      |
| Token Bucket        | `LPUSH`, `LPOP`, `RPUSH`     |
| Caching             | `SET` with `EX`              |
| Leaderboard         | `ZINCRBY`, `ZREVRANK`, `ZSCORE` |
| Audit Logging       | `XADD`, `XREAD`              |
| Real-Time Broadcast | `PUBLISH`, `SUBSCRIBE`       |

---

## Before running add .env inside backend folder
DATABASE_URL="Your PostgresDb URL"
REDIS_URL="Your Redis URL"
saltRound=9
JTW_SECRET="YourSecretKey"
PORT=3000


---

## How to Run

```bash

#clone the repo 
git clone https://github.com/Dev-Tanaay/Rate-Limited-Action-Logger.git

#Change Dir to backend
cd .\backend\

#install packages 
npm install

# run Express app
npm run dev

```

## How to Run with Docker

```bash

#clone the repo 
git clone https://github.com/Dev-Tanaay/Rate-Limited-Action-Logger.git

#Change Dir to backend
cd .\backend\

#docker compose
docker-compose up --build

```
