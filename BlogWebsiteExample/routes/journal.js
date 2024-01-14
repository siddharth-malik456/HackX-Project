const express = require("express");
const router = express.Router();
const Journal = require("../models/journal");
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
  const journals = await Journal.find({ authorName: req.user });
  res.render("journal/index", { journals });
});

router.post("/", async (req, res) => {
  const { description } = req.body;
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
  const newJournal = new Journal({
    description,
    date: currentDate,
    authorName: req.user,
  });
  await newJournal.save();
  res.redirect("/journal");
});

router.get("/new", async (req, res) => {
  res.render("journal/new");
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const journal = await Journal.find({ _id: id, authorName: req.user });
  console.log(journal.date);
  res.render("journal/show", { journal });
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  const deletedBlog = await Journal.findByIdAndDelete(id);
  res.redirect("/journal");
});

router.get("/:id/edit", async (req, res) => {
  const { id } = req.params;
  const journal = await Journal.findById(id);
  res.render("journal/edit", { journal });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const journal = await Journal.findByIdAndUpdate(id, req.body);
  res.redirect("/journal");
});

module.exports = router;
