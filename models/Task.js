const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "working", "review", "done", "archive"],
      default: "pending",
    },
    assignees: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
