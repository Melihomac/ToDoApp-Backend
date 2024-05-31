const mongoose = require("mongoose");

const ToDoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  photo: { type: String },
});

module.exports = mongoose.model("ToDo", ToDoSchema);
