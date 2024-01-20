const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  task: {
    type: String,
    set: (v) => (v ? v : "Untitled"),
    default: "Untitled",
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  state: {
    type: String,
    default: "Incomplete",
  },
});

module.exports = mongoose.model("Task", taskSchema);
