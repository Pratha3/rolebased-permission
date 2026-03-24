const resources = require("./resources");
const { hashPassword } = require("./security");

const seedRoles = [
  {
    _id: "role_admin",
    name: "Admin",
    description: "Full access to everything.",
    permissions: [{ resource: "*", actions: ["*"] }],
  },
  {
    _id: "role_marketing",
    name: "Marketing Lead",
    description: "Owns blog content and can view analytics.",
    permissions: [
      { resource: "blogs", actions: ["*"] },
      { resource: "analytics", actions: ["view"] },
    ],
  },
  {
    _id: "role_sales",
    name: "Sales Agent",
    description: "Works on inquiries and can view analytics.",
    permissions: [
      { resource: "inquiries", actions: ["view", "respond", "assign", "close"] },
      { resource: "analytics", actions: ["view"] },
    ],
  },
  {
    _id: "role_viewer",
    name: "Read Only",
    description: "Can only view everything.",
    permissions: resources.map((r) => ({ resource: r.id, actions: ["view"] })),
  },
];

function buildSeedUsers() {
  return [
    makeUser("user_alice", "Alice (Admin)", "alice@demo.test", "password123", [
      "role_admin",
    ]),
    makeUser(
      "user_marcy",
      "Marcy (Marketing Lead)",
      "marcy@demo.test",
      "password123",
      ["role_marketing"]
    ),
    makeUser("user_sam", "Sam (Sales Agent)", "sam@demo.test", "password123", [
      "role_sales",
    ]),
    makeUser("user_vera", "Vera (Viewer)", "vera@demo.test", "password123", [
      "role_viewer",
    ]),
  ];
}

function makeUser(id, name, email, password, roleIds) {
  const { salt, hash } = hashPassword(password, Buffer.from(id).toString("hex"));
  return {
    _id: id,
    name,
    email,
    passwordSalt: salt,
    passwordHash: hash,
    roleIds,
  };
}

module.exports = {
  seedRoles,
  buildSeedUsers,
};
