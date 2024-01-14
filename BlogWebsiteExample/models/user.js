const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    savedBlogs: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
    publishedBlogs: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
    aboutMe: {
      type: String,
    },
    workExperience: {
      type: String,
    },
    googleId: {
      type: String,
      required: true,
    },
  },
  { strictPopulate: false }
);

module.exports = mongoose.model("User", userSchema);
