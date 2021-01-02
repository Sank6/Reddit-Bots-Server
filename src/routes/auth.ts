import { Router } from "express";

import crypto from "crypto";
import passport from "passport";
import { Strategy } from "passport-reddit";

import cors from "@middleware/cors";
import auth from "@middleware/auth";
import parser from "body-parser";

import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";

import Report from "@models/reports";
import Bot from "@models/bot";

import * as config from "../../config.json";

const route: Router = Router();

// Setup Passport
passport.use(
  new Strategy(
    {
      clientID: config.reddit.clientId,
      clientSecret: config.reddit.clientSecret,
      callbackURL: `${config.server.base_url}/auth/callback`,
    },
    (
      _accessToken: any,
      _refreshToken: any,
      profile: Object,
      done: Function
    ) => {
      done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Setup rate limiter
const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

route.get("/auth/login", (req, res, next) => {
  req.session["state"] = crypto.randomBytes(32).toString("hex");
  passport.authenticate("reddit", {
    state: req.session["state"],
  })(req, res, next);
});

route.get("/auth/callback", (req, res, next) => {
  if (req.query.state == req.session["state"]) {
    passport.authenticate("reddit", {
      successRedirect: config.nuxt.base_url,
      failureRedirect: "/login",
    })(req, res, next);
  } else {
    res.status(403).json({ error: "Invalid state" });
  }
});

route.options("/auth/info", cors)
route.get("/auth/info", cors, auth, (req, res) => {
  const user: any = req.user;
  res.json({
    success: true,
    user: {
      username: user.name,
      avatar: user._json.subreddit.icon_img,
      karma: user._json.total_karma,
      created: new Date(user._json.created_utc * 1000),
    },
  });
});

route.options("/report", cors)
route.post(
  "/report",
  cors,
  reportLimiter,
  auth,
  parser.json(),
  body("userReported").isLength({ max: 20, min: 1 }),
  body("reason").isLength({ max: 200, min: 1 }),
  async (req, res) => {
    const user: any = req.user;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    const { userReported, reason } = req.body;

    const bot = await Bot.findOne({ username: userReported });
    if (!bot) return res.json({ error: "Invalid bot" });

    const report = await Report.findOne({ username: user.name, userReported });
    if (report)
      return res.json({ error: "You have already reported this user." });

    new Report({
      username: user.name,
      userReported,
      reason,
    }).save();

    res.json({ success: true });
  }
);

export default route;
