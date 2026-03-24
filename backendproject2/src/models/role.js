const { Schema, model } = require("mongoose");

const PermissionSchema = new Schema(
  {
    resource: { type: String, required: true },
    actions: { type: [String], required: true },
  },
  { _id: false }
);

const RoleSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    permissions: { type: [PermissionSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = model("Role", RoleSchema);
