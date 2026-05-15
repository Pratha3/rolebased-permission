const { Schema, model } = require("mongoose");

const InquirySchema = new Schema(
  {
    _id: { type: String, required: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "closed"],
      default: "open",
    },
    assignedToId: { type: String, default: null },
    assignedToName: { type: String, default: "" },
    response: { type: String, default: "" },
    respondedById: { type: String, default: null },
    respondedByName: { type: String, default: "" },
    respondedAt: { type: Date, default: null },
    closedById: { type: String, default: null },
    closedByName: { type: String, default: "" },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = model("Inquiry", InquirySchema);
