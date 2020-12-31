import { Router } from "express";

import Bot from '@models/bot';
import cors from '@middleware/cors';

import auth from './auth';

const route: Router = Router();

route.get("/", (_, res) => {
    res.status(200).send()
})

route.get("/list", cors, async (_, res) => {
    let bots = await Bot.aggregate([
        { $sort: { score: 1 } },
        { $limit: 50 },
        { $project: { _id: false, __v: false } }
    ]);
    res.json(bots);
});

route.use(auth)

export default route;
