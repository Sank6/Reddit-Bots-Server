import { Router } from "express";

import Bot from '@models/bot';

const route: Router = Router();

// Routes here

route.get("/list", async (_, res) => {
    let bots = await Bot.find({})
    res.json(bots)
})

export default route;