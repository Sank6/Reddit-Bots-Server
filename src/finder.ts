import SnooStream from "snoostream";
import Snoowrap from "snoowrap";
import ora from "ora";
import fetch from "node-fetch";

import * as config from "../config.json";

import shannon from "@tools/shannon";
import levenshtein from "@tools/levenshtein";

import Bot from "@models/bot";

const { username, password, clientId, clientSecret } = config.reddit;
const botRegex = /([^ro]bot[^(tle)|(tch)|(an)|(tom)])/g;

const r = new Snoowrap({
  userAgent: "A bot identifier tool",
  username,
  password,
  clientId,
  clientSecret,
});

const snooStream = SnooStream(r);
const commentStream = snooStream.commentStream("all");

let cache = [];
let cached_usernames = [];

let logger = ora("Setting up Reddit bot").start();
let init = false;

export default function finder() {
  commentStream.on("post", async (post) => {
    if (!init) {
      logger.succeed(`Connected to Reddit.`);
      init = true;
    }
    let points = 0;
    let authorflair = post.author_flair_text;
    let body = post.body.toLowerCase();
    let author = post.author.name;

    if (cached_usernames.includes(author)) return;

    // If the bot's username has the word 'bot' in it
    if (botRegex.test(author.toLowerCase())) points += 20;
    if (author.includes("-bot") || author.includes("_bot")) points += 10;

    // If the author has a flair with word 'bot' in it
    if (
      post.author_flair_type === "text" &&
      authorflair &&
      botRegex.test(authorflair.toLowerCase())
    )
      points += 20;

    // If the message claims to be a bot
    if (body.includes("i am a bot") || body.includes("i'm a bot")) points += 30;

    // If the message claims to not be a bot
    if (body.includes("not a bot") || body.includes("not automated"))
      points -= 60;

    // If the body includes a report feature
    if (body.includes("[report")) points += 20;

    // If the post is pinned in the comments thread
    if (post.stickied) points += 5;

    // If the author is a moderator
    if (
      post.distinguished == "moderator" ||
      post.distinguished == "admin" ||
      post.distinguished == "special"
    )
      points += 5;

    // If the post has a hidden vote count
    if (post.score_hidden) points += 5;

    // Consider the length of the message
    if (body.length > 1000) points += 5;
    else if (body.length > 5000) points += 10;

    // If the author's username is the same as the subreddit name
    if (
      author.toLowerCase() == post.subreddit.display_name.toLowerCase() ||
      author.toLowerCase() ==
        post.subreddit.display_name.toLowerCase() + "bot" ||
      author.toLowerCase() ==
        post.subreddit.display_name.toLowerCase() + "_bot" ||
      author.toLowerCase() == post.subreddit.display_name.toLowerCase() + "-bot"
    )
      points += 20;
    else if (
      author.toLowerCase().includes(post.subreddit.display_name.toLowerCase())
    )
      points += 10;

    // This part needs some computing power, so check significance
    if (points > 10) {
      // Consider the entropy of the message - Bots tend to use more entropy
      points += (shannon(post.body) - 4) * 15;
    }

    // This part makes a API requests, so only continue if the score is significant
    if (points > 45) {
      try {
        // If the post's parent was posted less than 5 seconds before the post
        let parent;
        if (post.parent_id.startsWith("t3_"))
          parent = r.getSubmission(post.parent_id);
        else parent = r.getComment(post.parent_id);
        parent = await parent.fetch();
        if (parent.created_utc - post.created_utc <= 5) points += 20;

        // Fetch the last 20 comments by this user in this subreddit and compare similarity
        let url = `https://api.pushshift.io/reddit/comment/search?author=${author}&subreddit=${post.subreddit.display_name}&sort=new`;
        let data = await (await fetch(url)).json();
        let bodies = data.data.map((x) => x.body);
        points += (1 - levenshtein(bodies)) * 40;

        // Karma thresholds
        let author_fetched = await post.author.fetch();
        if (author_fetched.total_karma < 1000) points -= 20;
        else if (author_fetched.total_karma > 10000) points += 20;
        // Threshold to check if the user is a bot
        if (points >= 70) {
          if (cached_usernames.includes(author)) return;
          cache.push({
            username: author,
            avatar: author_fetched.subreddit.display_name.icon_img,
            description:
              author_fetched.subreddit.display_name.public_description,
            cakeDay: new Date(author_fetched.created_utc * 1000),
            karma: author_fetched.total_karma,
          });
          cached_usernames.push(author);
        }
      } catch (e) {
        ora(`API error adding ${author}`).fail();
      }
    }
  });

  setInterval(() => {
    if (cache.length > 0)
      ora(
        `Added ${cache.length} users: ${cache
          .map((u) => u.username)
          .join(", ")}`
      ).info();
    Bot.insertMany(cache).catch((e) => ora(e.message).fail());
    cache = [];
  }, 1000 * 30);

  (async () => {
    cached_usernames = (await Bot.find({}).select("username -_id")).map(
      ({ username }) => username
    );
  })();
}

export { r };
