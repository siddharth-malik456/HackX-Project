// PACKAGE IMPORTS
const fs = require("fs");
const ejs = require("ejs");
const http = require("http");
const path = require("path");
const https = require("https");
const helmet = require("helmet");
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const socketio = require("socket.io");
const methodOverride = require("method-override");

// MONGO MODEL IMPORTS
const Blog = require("./models/blog");
const Review = require("./models/review");
const User = require("./models/user");
const Journal = require("./models/journal");

// ROUTES IMPORTS
const blogRoutes = require("./routes/blog");
const profileRoutes = require("./routes/profile");
const authRoutes = require("./routes/auth");
const reviewRoutes = require("./routes/review");
const journalRoutes = require("./routes/journal");

const { Schema } = mongoose;
const { Strategy } = require("passport-google-oauth20");
const { createProxyMiddleware } = require("http-proxy-middleware");

require("dotenv").config();

const app = express();
const PORT = 3301;

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/blogDB");
  console.log("Connection open");
}

const session = require("express-session");
const { userInfo } = require("os");
const { profile } = require("console");

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// GOOGLE SOCIAL SIGN IN
const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
};

const AUTH_OPTIONS = {
  callbackURL: "https://localhost:3301/auth/google/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

async function verifyCallback(accessToken, refreshToken, profile, done) {
  try {
    const existingUser = await User.findOne({ googleId: profile.id });
    if (existingUser) {
      return done(null, existingUser);
    }

    const newUser = new User({
      googleId: profile.id,
      name: profile.displayName,
    });

    await newUser.save();
    done(null, newUser);
  } catch (err) {
    done(err);
  }
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  done(null, id);
});

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));
app.use(
  session({
    secret: config.COOKIE_KEY_1,
    resave: false,
    saveUninitialized: true,
    cookie: {
      name: "session",
      keys: [config.COOKIE_KEY_1],
      maxAge: 3 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

function checkedLoggedIn(req, res, next) {
  const isLoggedIn = req.isAuthenticated() && req.user;
  if (!isLoggedIn) {
    return res.status(401).json({
      error: "You must be logged in",
    });
  }
  next();
}

// ROUTES
app.use("/blog", blogRoutes);
app.use("/profile", profileRoutes);
app.use("/review", reviewRoutes);
app.use("/journal", journalRoutes);

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

app.get("/auth/logout", (req, res) => {
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/failure", (req, res) => {
  res.send("You have failed to login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

// Journal ROUTES

app.get("/aboutus", (req, res) => {
  res.render("aboutus");
});

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.get("/rules", (req, res) => {
  res.render("rules");
});

https
  .createServer(
    {
      key: fs.readFileSync("certificates/key.pem"),
      cert: fs.readFileSync("certificates/cert.pem"),
    },
    app
  )
  .listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
