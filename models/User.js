const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, enum: ["Employee", "Manager"] },
    tasks: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Task" }],
    isResigned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
