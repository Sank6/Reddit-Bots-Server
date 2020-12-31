import { Router } from "express";

import Bot from '@models/bot';
import cors from '@middleware/cors';

import auth from './auth';

const route: Router = Router();

route.get("/", (_, res) => {
    res.status(200).send()
})

route.get("/list", cors, async (req, res) => {
    let page = parseInt(req.query.page as string) || 0;
    let bots = await Bot.aggregate([
        { $sort: { score: 1 } },
        { $skip: page * 50 },
        { $limit: 50 },
        { $project: { _id: false, __v: false } }
    ]);
    res.json(bots);
});

route.use(auth)

export default route;
