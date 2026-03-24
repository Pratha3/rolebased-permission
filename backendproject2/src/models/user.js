const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    roleIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = model("User", UserSchema);
