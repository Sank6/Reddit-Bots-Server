import { Router } from "express";

import session from "express-session";
import crypto from "crypto";
import passport, { use } from "passport";
import { Strategy } from "passport-reddit";

import cors from "@middleware/cors";

import * as config from "../../config.json";

const route: Router = Router();

route.use(
  session({
    secret: config.server.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      domain: `.${config.nuxt.baseURL.split("://")[1]}`
    },
    name: "reddit.connect.sid"
  })
);

route.use(passport.initialize());
route.use(passport.session());

passport.use(
  new Strategy(
    {
      clientID: config.reddit.clientId,
      clientSecret: config.reddit.clientSecret,
      callbackURL: `${config.server.base_url}/auth/callback`,
    },
    (_accessToken: any, _refreshToken: any, profile: Object, done: Function) => {
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

route.get("/auth/login", (req, res, next) => {
  req.session["state"] = crypto.randomBytes(32).toString("hex");
  passport.authenticate('reddit', {
      state: req.session["state"]
  })(req, res, next)
});

route.get("/auth/callback", (req, res, next) => {
  if (req.query.state == req.session["state"]) {
    passport.authenticate("reddit", {
      successRedirect: config.nuxt.baseURL,
      failureRedirect: "/login",
    })(req, res, next);
  } else {
    res.status(403).json({error: "Invalid state"});
  }
});

route.get("/auth/info", cors, (req, res) => {
    let user: any = req.user;
    if (req.isAuthenticated()) {
        res.json({success: true, user: {
            username: user.name,
            avatar: user._json.subreddit.icon_img,
            karma: user._json.total_karma,
            created: new Date(user._json.created_utc * 1000)
        }})
    } else {
        res.json({success: false, error: "Not authenticated"})
    }
})

export default route;
