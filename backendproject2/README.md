# Permission Management Backend (Mongo + WebSocket)

A compact RBAC backend for interns to practice permission-aware frontends. Stack: **Express + Mongoose + Socket.io**. It serves REST APIs, basic auth with signed tokens, and pushes real-time permission changes over a WebSocket. Data lives in MongoDB (Docker compose provided) and a seeder keeps the demo roles/users in sync.

## Run it locally

```bash
# 1) Start Mongo
docker compose up -d mongo

# 2) Install deps (network needed outside this sandbox)
npm install

# 3) Seed demo data
npm run seed

# 4) Start the server (PORT defaults to 4000)
PORT=4000 npm start
```

The sandbox environment here cannot bind ports or reach npm, so run the commands on your machine.
Note: startup seeding wipes and recreates roles/users for a clean demo state.

Env vars:
- `PORT` (default `4000`)
- `MONGO_URL` (default `mongodb://localhost:27017`)
- `DB_NAME` (default `permission_demo`)
- `AUTH_SECRET` (default `dev-secret-change-me`)

## Data model (seeded)

- Resources  
  - `blogs`: view, create, edit, publish, archive  
  - `inquiries`: view, respond, assign, close  
  - `analytics`: view, export
- Roles  
  - `role_admin` – `*` on everything  
  - `role_marketing` – all `blogs`, view `analytics`  
  - `role_sales` – manage `inquiries`, view `analytics`  
  - `role_viewer` – view-only on all resources
- Users  
  - Alice (Admin), Marcy (Marketing Lead), Sam (Sales Agent), Vera (Viewer)  
  - Seed login: `<first>@demo.test` / `password123` (e.g., `alice@demo.test`)

`*` or `manage` on a resource grants every action for that resource. Auth tokens are signed (HMAC) bearer tokens issued by `/auth/login`.
All API payloads use `_id` as the identifier field (e.g., `_id: "role_admin"`).

## REST API

Base URL: `http://localhost:4000`

- `POST /auth/login` → `{ token, user }`
- `GET /me` (Bearer) → user + roles + effective permissions
- `POST /me/password` (Bearer) → change password
- `GET /health`
- `GET /resources` and `GET /permissions` (same payload)
- `GET /roles` / `GET /roles/:id` / `GET /roles/:id/permissions`
- `POST /roles` `{ name, description?, permissions: [{ resource, actions: [] }] }`
- `PATCH /roles/:id` / `DELETE /roles/:id`
- `POST /roles/:id/permissions` (add) / `DELETE /roles/:id/permissions` (remove whole resource or specific actions)
- `GET /users` / `GET /users/:id`
- `POST /users` `{ name, email, password, roleIds?: [] }` / `PATCH /users/:id`
- `POST /users/:id/roles` `{ roleId }` / `DELETE /users/:id/roles/:roleId`
- `GET /users/:id/permissions`
- Profiles (user + roles + effective permissions): `GET /profiles`, `GET /profiles/:id`
- `POST /evaluate` `{ userId, resource, action }`
- `POST /reset` (reseed demo data)

Postman: import `postman_collection.json` (uses variables `{{baseUrl}}` and bearer `{{token}}`; call **Login** then set the token variable).

### Frontend flow cheat sheet
- Log in (`/auth/login`) and cache the `token`.
- Fetch current user + permissions (`/me`) to gate routes; refresh on socket `user.permissions` or after role/permission admin changes.
- Role admin:
  - Add actions to a role: `POST /roles/:id/permissions` with `{resource, actions[]}`.
  - Remove actions or whole resource: `DELETE /roles/:id/permissions` with `{resource, actions?}`.
  - Assign role to a user: `POST /users/:id/roles` then refetch that user’s permissions.
- Profiles for display/settings: `GET /profiles` or `GET /profiles/:id` (each includes user, roles with permissions, and effective permissions).
- Realtime: connect socket.io to `/ws?userId=...`; on `user.permissions` update local guards; on `snapshot` refresh cached lists.

### Quick curls

```bash
# Login as Alice (Admin)
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@demo.test","password":"password123"}'

# Create a limited “Blog Publisher” role
curl -X POST http://localhost:4000/roles \
  -H "Content-Type: application/json" \
  -d '{"name":"Blog Publisher","permissions":[{"resource":"blogs","actions":["view","publish"]}]}'

# Assign it to Vera (replace ROLE_ID with the id returned above)
curl -X PATCH http://localhost:4000/users/user_vera \
  -H "Content-Type: application/json" \
  -d '{"roleIds":["role_viewer","ROLE_ID"]}'

# Add role to Vera
curl -X POST http://localhost:4000/users/user_vera/roles \
  -H "Content-Type: application/json" \
  -d '{"roleId":"ROLE_ID"}'

# Check if Vera can publish a blog
curl -X POST http://localhost:4000/evaluate \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_vera","resource":"blogs","action":"publish"}'
```

## WebSocket feed (socket.io)

- Connect with socket.io client to `http://localhost:4000` using path `/ws` and query `userId`.
- Events emitted: `connected`, `snapshot`, `role.created|updated|deleted`, `user.created|updated`, `user.permissions`, `pong`.
- On role/user changes, affected users receive `user.permissions` with their recalculated matrix.

Minimal client (browser):

```html
<script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
<script>
  const socket = io("http://localhost:4000", { path: "/ws", query: { userId: "user_marcy" }});
  socket.on("snapshot", (data) => console.log("snapshot", data));
  socket.on("user.permissions", (data) => console.log("perms", data));
  socket.emit("ping");
</script>
```

## Files to skim

- `src/server.js` — HTTP routing, websocket wiring, seeding on boot.
- `src/store.js` — Mongo CRUD for roles/users + permission validation.
- `src/permissions.js` — effective permission matrix + access checks.
- `src/socket.js` — socket.io hub (path `/ws`).
- `src/resources.js` / `src/seed-data.js` — static resources and seed roles/users.
- `scripts/seed.js` — standalone seeder (`npm run seed`).
- `postman_collection.json` — ready-to-import Postman collection.
- `FRONTEND_ROLES.md` — quick map of roles and permissions for the UI.
