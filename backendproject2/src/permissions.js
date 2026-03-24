const resources = require("./resources");
const { listRoles, getUser } = require("./store");

async function getEffectivePermissionsForUser(userId) {
  const user = await getUser(userId);
  if (!user) return null;
  const allRoles = await listRoles();
  const userRoles = allRoles.filter((r) => user.roleIds.includes(r._id));

  const matrix = new Map();

  for (const role of userRoles) {
    for (const perm of role.permissions) {
      const targetResources =
        perm.resource === "*"
          ? resources.map((r) => r.id)
          : [perm.resource].filter(Boolean);

      for (const resourceId of targetResources) {
        const actions = resolveActions(resourceId, perm.actions);
        if (!matrix.has(resourceId)) matrix.set(resourceId, new Set());
        actions.forEach((a) => matrix.get(resourceId).add(a));
      }
    }
  }

  return {
    user,
    roles: userRoles,
    permissions: [...matrix.entries()].map(([resource, actions]) => ({
      resource,
      actions: [...actions],
    })),
  };
}

async function evaluateAccess(userId, resourceId, action) {
  const user = await getUser(userId);
  if (!user) {
    return { allowed: false, reasons: ["User not found"] };
  }

  const roles = (await listRoles()).filter((r) =>
    user.roleIds.includes(r._id)
  );
  const matches = [];

  for (const role of roles) {
    for (const perm of role.permissions) {
      if (perm.resource !== "*" && perm.resource !== resourceId) continue;
      const resolvedActions = resolveActions(resourceId, perm.actions);
      if (
        resolvedActions.includes("*") ||
        resolvedActions.includes(action.toLowerCase()) ||
        resolvedActions.includes("manage")
      ) {
        matches.push(`${role.name} allows ${action} on ${resourceId}`);
      }
    }
  }

  return {
    allowed: matches.length > 0,
    reasons: matches.length ? matches : ["No matching role permission"],
  };
}

function resolveActions(resourceId, actions) {
  const actionsLower = (actions || []).map((a) => String(a).toLowerCase());
  if (actionsLower.includes("*") || actionsLower.includes("manage")) {
    const resourceActions =
      resources.find((r) => r.id === resourceId)?.actions || [];
    return [...new Set([...resourceActions, "manage", "*"])];
  }
  return [...new Set(actionsLower)];
}

module.exports = {
  getEffectivePermissionsForUser,
  evaluateAccess,
};
