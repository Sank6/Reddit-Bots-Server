import * as ora from 'ora';
import * as mongoose from 'mongoose';
import * as cachegoose from 'cachegoose';

import * as config from "../config.json";

import setup from "./router";

let logger = ora("Loading...").start();
(async () => {
    // Initialize database connection...
    logger.text = "Connecting to Mongoose database...";
    cachegoose(mongoose);
    await mongoose.connect(config.server.mongodb_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    });
    logger.succeed(`Connected to Mongoose database.`);

    // Initialize router
    await setup();
})();