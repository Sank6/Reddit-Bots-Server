import { Router } from "express";

import * as config from "../../config.json";

import Bot from '@models/bot';

const route: Router = Router();

route.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

route.get("/list", async (_, res) => {
    let bots = await Bot.aggregate([
        { $sort: { score: 1 } },
        { $limit: 50 },
        { $project: { _id: false, __v: false } }
    ]);
    res.json(bots);
});

export default route;
