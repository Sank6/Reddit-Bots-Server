import ora from 'ora';
import cachegoose from 'cachegoose';
import mongoose from 'mongoose';

import * as config from "../config.json";

import setup from "./router";
import finder from './finder';

let logger = ora("Loading...").start();
(async () => {
    logger.text = "Connecting to Mongoose database...";
    cachegoose(mongoose);
    await mongoose.connect(config.server.mongodb_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    });
    logger.succeed(`Connected to Mongoose database.`);

    await setup();
    finder()
})();