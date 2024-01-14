const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const journalSchema = new Schema({
  date: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  authorName: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Journal", journalSchema);
