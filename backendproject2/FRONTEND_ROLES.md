# Frontend Role & Permission Map

Seeded roles (same IDs as stored in Mongo):

| Role ID | Name | Permissions |
| --- | --- | --- |
| `role_admin` | Admin | `*` on every resource (all actions) |
| `role_marketing` | Marketing Lead | `blogs`: all actions; `analytics`: view |
| `role_sales` | Sales Agent | `inquiries`: view/respond/assign/close; `analytics`: view |
| `role_viewer` | Read Only | `view` on `blogs`, `inquiries`, `analytics` |

Resources and actions:
- `blogs`: view, create, edit, publish, archive  
- `inquiries`: view, respond, assign, close  
- `analytics`: view, export

Auth for demo: seed users use email `<first>@demo.test` with password `password123` (e.g., `alice@demo.test`).

WebSocket (socket.io) hints for the UI:
- Connect to `http://localhost:4000` with path `/ws` and `query: { userId }`.
- Expect `snapshot` initially (roles/users/resources and the current user’s effective permissions).
- Listen for `user.permissions` to update UI guards live when an admin tweaks roles.

Profiles API (each entry includes user, roles with permissions, and effective permissions):
- `GET /profiles` returns every user.
- `GET /profiles/:userId` returns one user.

Update flows (for interns):
- Add actions to a role → `POST /roles/:id/permissions` `{resource, actions[]}`; remove via `DELETE /roles/:id/permissions`.
- Assign/remove a role for a user → `POST /users/:id/roles` / `DELETE /users/:id/roles/:roleId`, then refetch that user’s permissions or rely on socket `user.permissions`.
- Gate UI off `/me` or `/profiles/:id` response: `permissions` array plus `roles[].permissions`.

---

## API playbook (when to call, what to send, what you get)

All requests/ responses are JSON. On auth-only routes send header `Authorization: Bearer <token>`.

### 1) Login
- **POST /auth/login**  
  Body: `{ "email": "alice@demo.test", "password": "password123" }`  
  Success `200`: `{ "token": "...", "user": { _id, name, email, roleIds, createdAt, updatedAt } }`  
  Errors: `400` missing fields, `401` invalid credentials.
  Use token for all subsequent protected calls.

### 2) Current user with permissions
- **GET /me** (auth)  
  Returns `200`: `{ user, roles: [{id,name,description,permissions}], permissions: [{resource,actions}] }`  
  Use this to seed client-side permission cache after login.

### 3) Resources/Permissions reference
- **GET /resources** or **GET /permissions**  
  Returns list of resources `{ id, name, actions[] }`. No auth needed.

### 4) Roles
- **GET /roles** → array of roles.  
- **GET /roles/:id** → single role or `404`.  
- **GET /roles/:id/permissions** → the permissions array for that role.  
- **POST /roles** body `{ name, description?, permissions:[{resource,actions[]}] }` → `201 role`. Errors: `400` validation.  
- **PATCH /roles/:id** → update name/description/permissions. `404` if missing.  
- **DELETE /roles/:id** → `204` on success, `404` if missing.  
- **POST /roles/:id/permissions** body `{ resource, actions[] }` → updated role. Errors: `400` bad body, `404` role missing.  
- **DELETE /roles/:id/permissions** body `{ resource, actions? }` → updated role. If `actions` omitted, removes the whole resource entry.
  Use cases: admin UI for role editing; after mutation refresh roles list or rely on socket `role.updated`.

### 5) Users
- **GET /users** → array (password fields are never returned).  
- **GET /users/:id** → user sans password, or `404`.  
- **POST /users** body `{ name, email, password, roleIds?[] }` → `201 user`. Errors: `400` missing fields or duplicate email.  
- **PATCH /users/:id** → update name/email/password/roleIds. Returns updated user or `404`.  
- **POST /users/:id/roles** body `{ roleId }` → updated user, `404` if user or role missing, `400` if roleId missing.  
- **DELETE /users/:id/roles/:roleId** → updated user or `404`.  
- **GET /users/:id/permissions** → `{ user, roles:[{...full role...}], permissions:[{resource,actions}] }` or `404`.
  Use cases: user admin screen, assign roles, show effective permissions.

### 6) Profiles (user + roles + effective permissions in one call)
- **GET /profiles** → array of `{ user, roles:[{...full role...}], permissions }`.  
- **GET /profiles/:id** → same shape for one user or `404`.  
  Use cases: team directory, quick permission drill-down.

### 7) Access evaluation
- **POST /evaluate** body `{ userId, resource, action }`  
  Success `200`: `{ allowed: boolean, reasons: [string] }`  
  Errors: `400` missing fields; `200` with `allowed:false` if no permission.
  Use case: spot-check in tools/tests; frontend can call rarely—prefer caching `/me`.

### 8) Reset demo data
- **POST /reset** → reseeds roles/users. Returns counts. Use only in demos/tests.

### 9) Password change
- **POST /me/password** (auth) body `{ currentPassword, newPassword }`  
  Success: `{ status: "password_changed" }`  
  Errors: `400` missing field, `401` wrong current password.

### 10) Realtime (socket.io)
- Connect: `io("http://localhost:4000", { path: "/ws", query: { userId } })`  
- Events you’ll receive:  
  - `connected` `{ userId }`  
  - `snapshot` `{ resources, roles, users, viewer? }`  
  - `role.created|role.updated|role.deleted` with role payload  
  - `user.created|user.updated` with user payload  
  - `user.permissions` `{ user, roles:[{...full role...}], permissions }` (targeted to affected user)  
  - `pong` (reply to `ping`)  
  Use it to live-update guards when roles/users change.

### Common error shapes
- Validation: `400 { "error": "..." }`
- Not found: `404 { "error": "Role not found" }`
- Auth: `401 { "error": "Unauthorized" }`
- Server: `500 { "error": "Internal server error" }`

### Minimal client call order (happy path)
1. Login → store token.
2. Fetch `/me` → cache `permissions` & `roles`.
3. Open socket → listen for `snapshot` and `user.permissions` to keep cache fresh.
4. Admin actions: mutate roles/users via POST/PATCH/DELETE, then either re-fetch lists or rely on socket events. Guarded views re-evaluate from cached permissions.

Common UI guard examples:
- Allow “Publish blog” if `permissions.blogs` contains `publish` or `*`.
- Allow “Assign inquiry” if `permissions.inquiries` includes `assign` or `manage`.
- Read-only views: check for `view` on the relevant resource.
