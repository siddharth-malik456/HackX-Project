const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      reqiured: true,
    },
    googleId: {
      type: String,
    },
    authorName: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    category: {
      type: String,
      required: true,
    },
    publishedDate: {
      type: String,
      required: true,
    },
  },
  { strictPopulate: false }
);

module.exports = mongoose.model("Blog", blogSchema);
