const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/user");
const router = express.Router();

function checkedLoggedIn(req, res, next) {
  console.log("The current user is ", req.user);
  const isLoggedIn = req.isAuthenticated() && req.user;
  if (!isLoggedIn) {
    return res.status(401).json({
      error: "You must be logged in",
    });
  }
  next();
}

router.get("/show", checkedLoggedIn, async (req, res) => {
  const user = await User.findById(req.user);
  res.render("profile/show", { user });
});

router.get("/edit", checkedLoggedIn, async (req, res) => {
  const user = await User.findById(req.user);
  res.render("profile/edit", { user });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(id, req.body);
  res.redirect("/profile/edit");
});

module.exports = router;
