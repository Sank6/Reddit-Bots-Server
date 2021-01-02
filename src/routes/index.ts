import { Router } from "express";

import Bot from "@models/bot";
import cors from "@middleware/cors";

import auth from "./auth";

import slowDown from "express-slow-down";

const route: Router = Router();

// Setup slow down
const listLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 10,
  delayMs: 100,
});
const botLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 20,
  delayMs: 100,
});

route.get("/", (_, res) => {
  res.status(200).send();
});

route.options("/list", cors)
route.get("/list", cors, listLimiter, async (req, res) => {
  let page = parseInt(req.query.page as string) || 0;
  let bots = await Bot.aggregate([
    { $sort: { dateAdded: -1 } },
    { $skip: page * 50 },
    { $limit: 50 },
    { $project: { _id: false, __v: false } },
  ]);
  res.json(bots);
});


route.options("/bot/:username", cors)
let cooldown = false;
route.get("/bot/:username", cors, botLimiter, async (req, res) => {
  let { username } = req.params;
  let bot = await Bot.findOne({ username }, { _id: false, __v: false });
  if (!bot) return res.json({ error: "Invalid request" });
  if (!cooldown) {
    cooldown = true;
    setTimeout(() => {
      cooldown = true;
    }, 20 * 1000);

    try {
      let r = req.app.get("reddit");
      let user = await r.getUser(username).fetch();
      let botInfo = await Bot.findOneAndUpdate(
        { username },
        {
          $set: {
            avatar: user.subreddit.display_name.icon_img,
            description: user.subreddit.display_name.public_description,
            cakeDay: new Date(user.created_utc * 1000),
            karma: user.total_karma,
            lastUpdated: new Date(),
          },
        },
        {
          fields: {
            _id: false,
            __v: false
          },
        }
      );
      return res.json(botInfo);
    } catch(e) {
      return res.json(bot)
    }
  } else {
    return res.json(bot);
  }
});

route.use(auth);

export default route;
