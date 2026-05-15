const { Schema, model } = require("mongoose");

const BlogSchema = new Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: "", trim: true },
    content: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    views: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = model("Blog", BlogSchema);
