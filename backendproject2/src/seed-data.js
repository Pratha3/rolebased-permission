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

const seedBlogs = [
  {
    _id: "blog_nextjs_start",
    title: "Getting Started with Next.js 15",
    excerpt: "A practical starter guide for teams building dashboard apps.",
    content:
      "Next.js gives teams a productive way to build routed React applications with server rendering, client components, and strong conventions.",
    status: "published",
    authorId: "user_marcy",
    authorName: "Marcy (Marketing Lead)",
    views: 1234,
    publishedAt: new Date("2024-03-01T10:00:00.000Z"),
  },
  {
    _id: "blog_rsc",
    title: "Understanding React Server Components",
    excerpt: "How server components change data loading and page composition.",
    content:
      "React Server Components help keep sensitive logic on the server and reduce the amount of JavaScript sent to the browser.",
    status: "draft",
    authorId: "user_marcy",
    authorName: "Marcy (Marketing Lead)",
    views: 567,
    publishedAt: null,
  },
  {
    _id: "blog_node_apis",
    title: "Building Scalable APIs with Node.js",
    excerpt: "Patterns for simple, testable API modules.",
    content:
      "Small route handlers, focused services, and clear validation make Node APIs easier to maintain as the product grows.",
    status: "published",
    authorId: "user_alice",
    authorName: "Alice (Admin)",
    views: 2341,
    publishedAt: new Date("2024-03-10T10:00:00.000Z"),
  },
];

const seedInquiries = [
  {
    _id: "inquiry_demo_request",
    subject: "Product Demo Request",
    message: "I would like to schedule a product demo for my team next week.",
    customerName: "Alice Johnson",
    customerEmail: "alice@example.com",
    priority: "high",
    status: "open",
    assignedToId: null,
    assignedToName: "",
    response: "",
    respondedById: null,
    respondedByName: "",
    respondedAt: null,
    closedById: null,
    closedByName: "",
    closedAt: null,
    createdAt: new Date("2024-03-15T09:30:00.000Z"),
    updatedAt: new Date("2024-03-15T09:30:00.000Z"),
  },
  {
    _id: "inquiry_billing_question",
    subject: "Billing Question",
    message: "Can you explain the annual billing discount and invoice cycle?",
    customerName: "Bob Smith",
    customerEmail: "bob@example.com",
    priority: "medium",
    status: "in-progress",
    assignedToId: "user_sam",
    assignedToName: "Sam (Sales Agent)",
    response:
      "I shared the annual billing options and asked for their preferred invoice date.",
    respondedById: "user_sam",
    respondedByName: "Sam (Sales Agent)",
    respondedAt: new Date("2024-03-14T13:15:00.000Z"),
    closedById: null,
    closedByName: "",
    closedAt: null,
    createdAt: new Date("2024-03-14T11:00:00.000Z"),
    updatedAt: new Date("2024-03-14T13:15:00.000Z"),
  },
  {
    _id: "inquiry_feature_request",
    subject: "Feature Request",
    message: "Please add CSV export for inquiry reports.",
    customerName: "Carol White",
    customerEmail: "carol@example.com",
    priority: "low",
    status: "closed",
    assignedToId: "user_sam",
    assignedToName: "Sam (Sales Agent)",
    response: "The request was logged for product review.",
    respondedById: "user_sam",
    respondedByName: "Sam (Sales Agent)",
    respondedAt: new Date("2024-03-10T10:45:00.000Z"),
    closedById: "user_alice",
    closedByName: "Alice (Admin)",
    closedAt: new Date("2024-03-10T12:00:00.000Z"),
    createdAt: new Date("2024-03-10T09:00:00.000Z"),
    updatedAt: new Date("2024-03-10T12:00:00.000Z"),
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
  seedBlogs,
  seedInquiries,
  buildSeedUsers,
};
