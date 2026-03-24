const { randomUUID } = require("crypto");
const Role = require("./models/role");
const User = require("./models/user");
const resources = require("./resources");
const { seedRoles, buildSeedUsers } = require("./seed-data");
const { hashPassword } = require("./security");

const resourceIds = new Set(resources.map((r) => r.id));

function normalizePermissions(perms = []) {
  return perms.map((p) => ({
    resource: p.resource,
    actions: Array.from(
      new Set((p.actions || []).map((a) => String(a).toLowerCase()))
    ),
  }));
}

function validatePermissions(perms) {
  for (const perm of perms) {
    if (!perm.resource) {
      return { valid: false, error: "Permission missing resource id" };
    }
    if (perm.resource !== "*" && !resourceIds.has(perm.resource)) {
      return { valid: false, error: `Unknown resource ${perm.resource}` };
    }
    if (!Array.isArray(perm.actions) || perm.actions.length === 0) {
      return { valid: false, error: "Permission requires actions array" };
    }
  }
  return { valid: true };
}

async function listRoles() {
  return Role.find({}).lean();
}

async function getRole(id) {
  return Role.findById(id).lean();
}

async function createRole(payload) {
  const role = {
    _id: payload._id || `role_${randomUUID().slice(0, 8)}`,
    name: payload.name,
    description: payload.description || "",
    permissions: normalizePermissions(payload.permissions),
  };
  await Role.create(role);
  return role;
}

async function updateRole(id, patch) {
  const update = {};
  if (patch.name) update.name = patch.name;
  if (patch.description !== undefined) update.description = patch.description;
  if (Array.isArray(patch.permissions)) {
    update.permissions = normalizePermissions(patch.permissions);
  }
  if (!Object.keys(update).length) return getRole(id);
  const updated = await Role.findByIdAndUpdate(id, update, {
    new: true,
    lean: true,
  });
  return updated;
}

async function deleteRole(id) {
  await Role.deleteOne({ _id: id });
  await User.updateMany({}, { $pull: { roleIds: id } });
}

function stripUser(user) {
  if (!user) return user;
  const { passwordHash, passwordSalt, __v, ...safe } = user;
  return safe;
}

async function listUsers() {
  const users = await User.find({}, { passwordHash: 0, passwordSalt: 0 }).lean();
  return users;
}

async function getUser(id) {
  const user = await User.findById(id).lean();
  return stripUser(user);
}

async function createUser(payload) {
  const user = {
    _id: payload._id || `user_${randomUUID().slice(0, 8)}`,
    name: payload.name,
    email: payload.email,
    passwordHash: payload.passwordHash,
    passwordSalt: payload.passwordSalt,
    roleIds: Array.isArray(payload.roleIds)
      ? [...new Set(payload.roleIds)]
      : [],
  };
  await User.create(user);
  return stripUser(user);
}

async function updateUser(id, patch) {
  const update = {};
  if (patch.name) update.name = patch.name;
  if (patch.email) update.email = patch.email;
  if (patch.passwordHash && patch.passwordSalt) {
    update.passwordHash = patch.passwordHash;
    update.passwordSalt = patch.passwordSalt;
  }
  if (Array.isArray(patch.roleIds)) update.roleIds = [...new Set(patch.roleIds)];
  if (!Object.keys(update).length) return getUser(id);
  const updated = await User.findByIdAndUpdate(id, update, {
    new: true,
    lean: true,
  });
  return stripUser(updated);
}

async function getUsersWithRole(roleId) {
  return User.find({ roleIds: roleId }).lean();
}

async function seedDatabase() {
  await Role.deleteMany({});
  await User.deleteMany({});
  await Role.insertMany(seedRoles);
  const users = buildSeedUsers();
  await User.insertMany(users);
  return { roles: seedRoles, users };
}

async function findUserByEmail(email) {
  if (!email) return null;
  const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();
  return user;
}

async function addRoleToUser(userId, roleId) {
  const role = await Role.findById(roleId).lean();
  if (!role) return null;
  await User.updateOne({ _id: userId }, { $addToSet: { roleIds: roleId } });
  return getUser(userId);
}

async function removeRoleFromUser(userId, roleId) {
  await User.updateOne({ _id: userId }, { $pull: { roleIds: roleId } });
  return getUser(userId);
}

async function addPermissionToRole(roleId, permission) {
  const role = await Role.findById(roleId);
  if (!role) return null;
  const perms = role.permissions || [];
  const normalized = normalizePermissions([permission])[0];
  const idx = perms.findIndex((p) => p.resource === normalized.resource);
  if (idx === -1) {
    perms.push(normalized);
  } else {
    const merged = new Set([...perms[idx].actions, ...normalized.actions]);
    perms[idx].actions = [...merged];
  }
  role.permissions = perms;
  await role.save();
  return role.toObject();
}

async function removePermissionFromRole(roleId, resource, actions) {
  const role = await Role.findById(roleId);
  if (!role) return null;
  const perms = role.permissions || [];
  const idx = perms.findIndex((p) => p.resource === resource);
  if (idx === -1) return role.toObject();
  if (!actions || actions.length === 0) {
    perms.splice(idx, 1);
  } else {
    const removeSet = new Set(actions.map((x) => x.toLowerCase()));
    const keep = perms[idx].actions.filter((a) => !removeSet.has(a));
    if (keep.length === 0) {
      perms.splice(idx, 1);
    } else {
      perms[idx].actions = keep;
    }
  }
  role.permissions = perms;
  await role.save();
  return role.toObject();
}

module.exports = {
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
  findUserByEmail,
  addRoleToUser,
  removeRoleFromUser,
  addPermissionToRole,
  removePermissionFromRole,
};
