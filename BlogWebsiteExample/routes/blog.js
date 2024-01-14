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

router.get("/", async (req, res) => {
  const blogs = await Blog.find({}).populate({
    path: "authorName",
    populate: {
      path: "reviews",
      populate: {
        path: "authorName",
      },
    },
  });
  res.render("blog/index", { blogs, user: req.user });
});

router.get("/new", checkedLoggedIn, async (req, res) => {
  res.render("blog/new");
});

router.get("/:id/search", async (req, res) => {
  const { id } = req.params;
  let blogs;
  if (id == "All") {
    blogs = await Blog.find({}).populate({
      path: "authorName",
      populate: {
        path: "reviews",
        populate: {
          path: "authorName",
        },
      },
    });
  } else {
    blogs = await Blog.find({ category: id }).populate({
      path: "authorName",
      populate: {
        path: "reviews",
        populate: {
          path: "authorName",
        },
      },
    });
  }

  res.render("blog/index", { blogs });
});

router.get("/:id", checkedLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id)
      .populate({
        path: "authorName",
        populate: {
          path: "reviews",
          populate: {
            path: "authorName",
          },
        },
      })
      .populate("reviews");
    const isUser = req.user == blog.authorName._id;
    res.render("blog/show", { blog, isUser, user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching blog details");
  }
});

router.post("/", checkedLoggedIn, async (req, res) => {
  const { title, description, category } = req.body;
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let currentDate = `${day}-${month}-${year}`;
  const author = await User.findOne({ _id: req.user });
  if (!author) {
    console.error("Author not found");
    return res.status(400).send("Author not found");
  }
  const newBlog = new Blog({
    title,
    description,
    publishedDate: currentDate,
    authorName: req.user,
    category,
  });
  await newBlog.save().then(console.log(newBlog));
  res.redirect("/blog");
});

router.delete("/:id", checkedLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  if (req.user == blog.authorName) {
    const deletedBlog = await Blog.findByIdAndDelete(id);
  }
  res.redirect(`/blog`);
});

router.get("/:id/edit", checkedLoggedIn, async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  res.render("blog/edit", { blog });
});

router.put("/:id", checkedLoggedIn, async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  if (req.user == blog.authorName) {
    const updatedProduct = await Blog.findByIdAndUpdate(id, req.body);
  }
  res.redirect("/blog");
});

module.exports = router;
