const express = require("express");
const router = express.Router();
const Blog = require("../models/blog");
const Review = require("../models/review");
const User = require("../models/user");

function checkedLoggedIn(req, res, next) {
  const isLoggedIn = req.isAuthenticated() && req.user;
  if (!isLoggedIn) {
    return res.status(401).json({
      error: "You must be logged in",
    });
  }
  next();
}

router.get("/:blogId/new", async (req, res) => {
  const { blogId } = req.params;
  const blog = await Blog.findById(blogId);
  res.render("review/new", { blog });
});

router.post("/:blogId", async (req, res) => {
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let currentDate = `${day}-${month}-${year}`;
  const { blogId } = req.params;
  const { title, description } = req.body;
  const author = await User.findOne({ _id: req.user });
  if (!author) {
    console.error("Author not found");
    return res.status(400).send("Author not found");
  }
  const section = await Blog.findById(blogId).populate("reviews");
  const newReview = new Review({
    title,
    description,
    date: currentDate,
    authorName: author,
  });

  try {
    await newReview.save();
    section.reviews.push(newReview);
    await section.save();
    res.redirect(`/blog/${blogId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating review");
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const deletedProduct = await Review.findByIdAndDelete(id);
  res.redirect(`/blog`);
});

module.exports = router;
