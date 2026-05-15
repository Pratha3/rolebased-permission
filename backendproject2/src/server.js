const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const resources = require("./resources");
const { connectMongo } = require("./db");
const {
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  listUsers,
  getUser,
  createUser,
  updateUser,
  getUsersWithRole,
  seedDatabase,
  validatePermissions,
} = require("./store");
const {
  getEffectivePermissionsForUser,
  evaluateAccess,
} = require("./permissions");
const { initSocket } = require("./socket");
const { PORT } = require("./config");
const {
  authRequired,
  handleLogin,
  handleChangePassword,
} = require("./auth");
const { hashPassword } = require("./security");
const {
  findUserByEmail,
  addRoleToUser,
  removeRoleFromUser,
  addPermissionToRole,
  assignInquiry,
  archiveBlog,
  closeInquiry,
  createBlog,
  getBlog,
  getInquiry,
  listBlogs,
  listInquiries,
  publishBlog,
  removePermissionFromRole,
  respondToInquiry,
  updateBlog,
} = require("./store");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.get("/health", (req, res) =>
  res.json({ status: "ok", now: new Date().toISOString() })
);

app.get("/resources", (req, res) => res.json(resources));
app.get("/permissions", (req, res) => res.json(resources));

app.get(
  "/blogs",
  authRequired,
  requirePermission("blogs", "view"),
  asyncHandler(async (req, res) => {
    res.json(await listBlogs());
  })
);

app.post(
  "/blogs",
  authRequired,
  requirePermission("blogs", "create"),
  asyncHandler(async (req, res) => {
    const { title, excerpt, content } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: "Blog title is required" });
    }
    const blog = await createBlog({
      title: String(title).trim(),
      excerpt: excerpt ? String(excerpt).trim() : "",
      content: content ? String(content) : "",
      authorId: req.user._id,
      authorName: req.user.name,
    });
    socket.broadcast("blog.created", blog);
    res.status(201).json(blog);
  })
);

app.patch(
  "/blogs/:id",
  authRequired,
  requirePermission("blogs", "edit"),
  asyncHandler(async (req, res) => {
    const existing = await getBlog(req.params.id);
    if (!existing) return res.status(404).json({ error: "Blog not found" });
    const updated = await updateBlog(req.params.id, req.body || {});
    socket.broadcast("blog.updated", updated);
    res.json(updated);
  })
);

app.post(
  "/blogs/:id/publish",
  authRequired,
  requirePermission("blogs", "publish"),
  asyncHandler(async (req, res) => {
    const updated = await publishBlog(req.params.id);
    if (!updated) return res.status(404).json({ error: "Blog not found" });
    socket.broadcast("blog.updated", updated);
    res.json(updated);
  })
);

app.post(
  "/blogs/:id/archive",
  authRequired,
  requirePermission("blogs", "archive"),
  asyncHandler(async (req, res) => {
    const updated = await archiveBlog(req.params.id);
    if (!updated) return res.status(404).json({ error: "Blog not found" });
    socket.broadcast("blog.updated", updated);
    res.json(updated);
  })
);

app.get(
  "/inquiries",
  authRequired,
  requirePermission("inquiries", "view"),
  asyncHandler(async (req, res) => {
    res.json(await listInquiries());
  })
);

app.post(
  "/inquiries/:id/assign",
  authRequired,
  requirePermission("inquiries", "assign"),
  asyncHandler(async (req, res) => {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const inquiry = await getInquiry(req.params.id);
    if (!inquiry) return res.status(404).json({ error: "Inquiry not found" });
    const assignee = await getUser(userId);
    if (!assignee) return res.status(404).json({ error: "Assignee not found" });
    const updated = await assignInquiry(req.params.id, assignee);
    socket.broadcast("inquiry.updated", updated);
    res.json(updated);
  })
);

app.post(
  "/inquiries/:id/respond",
  authRequired,
  requirePermission("inquiries", "respond"),
  asyncHandler(async (req, res) => {
    const { response } = req.body || {};
    if (!response || !String(response).trim()) {
      return res.status(400).json({ error: "response is required" });
    }
    const inquiry = await getInquiry(req.params.id);
    if (!inquiry) return res.status(404).json({ error: "Inquiry not found" });
    const updated = await respondToInquiry(
      req.params.id,
      req.user,
      String(response).trim()
    );
    socket.broadcast("inquiry.updated", updated);
    res.json(updated);
  })
);

app.post(
  "/inquiries/:id/close",
  authRequired,
  requirePermission("inquiries", "close"),
  asyncHandler(async (req, res) => {
    const inquiry = await getInquiry(req.params.id);
    if (!inquiry) return res.status(404).json({ error: "Inquiry not found" });
    const updated = await closeInquiry(req.params.id, req.user);
    socket.broadcast("inquiry.updated", updated);
    res.json(updated);
  })
);

// Auth
app.post("/auth/login", asyncHandler(handleLogin));
app.get(
  "/me",
  authRequired,
  asyncHandler(async (req, res) => {
    const matrix = await getEffectivePermissionsForUser(req.user._id);
    res.json({
      user: matrix.user,
      roles: matrix.roles.map((r) => ({
        id: r._id,
        name: r.name,
        description: r.description,
        permissions: r.permissions,
      })),
      permissions: matrix.permissions,
    });
  })
);
app.post("/me/password", authRequired, asyncHandler(handleChangePassword));

app.get(
  "/roles",
  asyncHandler(async (req, res) => {
    res.json(await listRoles());
  })
);

app.get(
  "/roles/:id",
  asyncHandler(async (req, res) => {
    const role = await getRole(req.params.id);
    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json(role);
  })
);

app.get(
  "/roles/:id/permissions",
  asyncHandler(async (req, res) => {
    const role = await getRole(req.params.id);
    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json(role.permissions);
  })
);

app.post(
  "/roles",
  asyncHandler(async (req, res) => {
    const body = req.body;
    if (!body.name || !Array.isArray(body.permissions)) {
      return res
        .status(400)
        .json({ error: "Role requires name and permissions array" });
    }
    const validation = validatePermissions(body.permissions);
    if (!validation.valid) return res.status(400).json({ error: validation.error });
    const role = await createRole(body);
    await notifyRoleChange("role.created", role);
    res.status(201).json(role);
  })
);

app.post(
  "/roles/:id/permissions",
  asyncHandler(async (req, res) => {
    const { resource, actions } = req.body || {};
    if (!resource || !Array.isArray(actions) || actions.length === 0) {
      return res
        .status(400)
        .json({ error: "resource and actions[] are required" });
    }
    const validation = validatePermissions([{ resource, actions }]);
    if (!validation.valid) return res.status(400).json({ error: validation.error });
    const updated = await addPermissionToRole(req.params.id, { resource, actions });
    if (!updated) return res.status(404).json({ error: "Role not found" });
    await notifyRoleChange("role.updated", updated);
    res.json(updated);
  })
);

app.delete(
  "/roles/:id/permissions",
  asyncHandler(async (req, res) => {
    const { resource, actions } = req.body || {};
    if (!resource) return res.status(400).json({ error: "resource is required" });
    const updated = await removePermissionFromRole(
      req.params.id,
      resource,
      Array.isArray(actions) ? actions : undefined
    );
    if (!updated) return res.status(404).json({ error: "Role not found" });
    await notifyRoleChange("role.updated", updated);
    res.json(updated);
  })
);

app.patch(
  "/roles/:id",
  asyncHandler(async (req, res) => {
    const body = req.body;
    if (body.permissions) {
      const validation = validatePermissions(body.permissions);
      if (!validation.valid)
        return res.status(400).json({ error: validation.error });
    }
    const updated = await updateRole(req.params.id, body);
    if (!updated) return res.status(404).json({ error: "Role not found" });
    await notifyRoleChange("role.updated", updated);
    res.json(updated);
  })
);

app.delete(
  "/roles/:id",
  asyncHandler(async (req, res) => {
    const existing = await getRole(req.params.id);
    if (!existing) return res.status(404).json({ error: "Role not found" });
    const impactedUserIds = (await getUsersWithRole(req.params.id)).map(
      (u) => u._id
    );
    await deleteRole(req.params.id);
    await notifyRoleChange("role.deleted", existing, impactedUserIds);
    res.status(204).end();
  })
);

app.get(
  "/users",
  asyncHandler(async (req, res) => {
    res.json(await listUsers());
  })
);

app.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const user = await getUser(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  })
);

app.post(
  "/users",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "User requires name, email, password" });
    }
    if (await findUserByEmail(email)) {
      return res.status(400).json({ error: "Email already in use" });
    }
    const { salt, hash } = hashPassword(password);
    const user = await createUser({
      ...req.body,
      passwordSalt: salt,
      passwordHash: hash,
    });
    await notifyUserChange("user.created", user);
    res.status(201).json(user);
  })
);

app.patch(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const updated = await updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "User not found" });
    await notifyUserChange("user.updated", updated);
    res.json(updated);
  })
);

app.post(
  "/users/:id/roles",
  asyncHandler(async (req, res) => {
    const { roleId } = req.body || {};
    if (!roleId) return res.status(400).json({ error: "roleId is required" });
    const updated = await addRoleToUser(req.params.id, roleId);
    if (!updated)
      return res.status(404).json({ error: "User or role not found" });
    await notifyUserChange("user.updated", updated);
    res.json(updated);
  })
);

app.delete(
  "/users/:id/roles/:roleId",
  asyncHandler(async (req, res) => {
    const updated = await removeRoleFromUser(req.params.id, req.params.roleId);
    if (!updated) return res.status(404).json({ error: "User not found" });
    await notifyUserChange("user.updated", updated);
    res.json(updated);
  })
);

app.get(
  "/users/:id/permissions",
  asyncHandler(async (req, res) => {
    const matrix = await getEffectivePermissionsForUser(req.params.id);
    if (!matrix) return res.status(404).json({ error: "User not found" });
    res.json({
      user: matrix.user,
      roles: matrix.roles.map((r) => ({
        id: r._id,
        name: r.name,
        description: r.description,
        permissions: r.permissions,
      })),
      permissions: matrix.permissions,
    });
  })
);

// Profile endpoints (user + roles + effective permissions)
app.get(
  "/profiles",
  asyncHandler(async (req, res) => {
    const users = await listUsers();
    const profiles = [];
    for (const u of users) {
      const matrix = await getEffectivePermissionsForUser(u._id);
      profiles.push({
        user: matrix.user,
        roles: matrix.roles.map((r) => ({
          id: r._id,
          name: r.name,
          description: r.description,
          permissions: r.permissions,
        })),
        permissions: matrix.permissions,
      });
    }
    res.json(profiles);
  })
);

app.get(
  "/profiles/:id",
  asyncHandler(async (req, res) => {
    const matrix = await getEffectivePermissionsForUser(req.params.id);
    if (!matrix) return res.status(404).json({ error: "User not found" });
    res.json({
      user: matrix.user,
      roles: matrix.roles.map((r) => ({
        id: r._id,
        name: r.name,
        description: r.description,
        permissions: r.permissions,
      })),
      permissions: matrix.permissions,
    });
  })
);

app.post(
  "/evaluate",
  asyncHandler(async (req, res) => {
    const body = req.body;
    if (!body.userId || !body.resource || !body.action) {
      return res
        .status(400)
        .json({ error: "Requires userId, resource, and action fields" });
    }
    const verdict = await evaluateAccess(body.userId, body.resource, body.action);
    res.json(verdict);
  })
);

app.post(
  "/reset",
  asyncHandler(async (req, res) => {
    const seeded = await seedDatabase();
    socket.broadcast("snapshot", await buildSnapshot(null));
    res.json({ status: "reset", counts: { roles: seeded.roles.length, users: seeded.users.length } });
  })
);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// Bootstrap server + sockets
const server = http.createServer(app);
const socket = initSocket(server, {
  onClientConnected: async ({ socket, userId }) => {
    socket.emit("snapshot", await buildSnapshot(userId));
    if (userId) await pushUserPermissions(userId);
  },
});

connectMongo()
  .then(seedDatabase)
  .then(() => {
    server.listen(PORT, () =>
      console.log(`Express permission backend on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
  });

async function notifyRoleChange(event, role, impactedUserIds) {
  socket.broadcast(event, role);
  const affected =
    impactedUserIds ??
    (await getUsersWithRole(role._id)).map((user) => user._id);
  for (const userId of affected) {
    await pushUserPermissions(userId);
  }
}

async function notifyUserChange(event, user) {
  socket.broadcast(event, user);
  await pushUserPermissions(user._id);
}

async function pushUserPermissions(userId) {
  const matrix = await getEffectivePermissionsForUser(userId);
  if (!matrix) return;
  socket.emitToUsers([userId], "user.permissions", {
    user: { id: matrix.user._id, name: matrix.user.name },
    roles: matrix.roles.map((r) => ({
      id: r._id,
      name: r.name,
      description: r.description,
      permissions: r.permissions,
    })),
    permissions: matrix.permissions,
  });
}

async function buildSnapshot(requestingUserId) {
  const payload = {
    resources,
    roles: await listRoles(),
    users: await listUsers(),
  };
  if (requestingUserId) {
    const matrix = await getEffectivePermissionsForUser(requestingUserId);
    if (matrix) {
      payload.viewer = {
        user: { id: matrix.user._id, name: matrix.user.name },
        permissions: matrix.permissions,
        roles: matrix.roles.map((r) => ({
          id: r._id,
          name: r.name,
          description: r.description,
          permissions: r.permissions,
        })),
      };
    }
  }
  return payload;
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function requirePermission(resource, action) {
  return asyncHandler(async (req, res, next) => {
    const verdict = await evaluateAccess(req.user._id, resource, action);
    if (!verdict.allowed) {
      return res.status(403).json({
        error: `Requires ${action} permission on ${resource}`,
        reasons: verdict.reasons,
      });
    }
    next();
  });
}
