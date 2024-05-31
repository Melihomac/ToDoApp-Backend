const mongoose = require("mongoose");

const ToDoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  photo: { type: String },
});

module.exports = mongoose.model("ToDo", ToDoSchema);
