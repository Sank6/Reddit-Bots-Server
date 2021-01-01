import ora from 'ora';
import express, { Express } from "express";
import session from "express-session";
import passport from "passport";

import * as config from "../config.json";

import router from "./routes/index";

export default async function setup(): Promise<Express> {

    const logger = ora("Loading express").start();
    const app = express();
    const port = config.server.port;

    app.disable('x-powered-by');
    app.set('trust proxy', true);

    app.use(session({
        secret: config.server.secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            domain: config.server.cookieDomain
        }
    }));

    // Passport middleware
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });

    app.get('/logout', async (req, res) => {
        req.logout();
        res.redirect(config.nuxt.base_url);
    });
    
    // Reddit passport auth

    app.use("/", router);

    await new Promise<void>((resolve) => {
        app.listen(port, () => {
            logger.succeed(`API running on port ${port}.`);
            resolve();
        });
    });

    return;
}