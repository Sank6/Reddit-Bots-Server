import {Request, Response, NextFunction} from 'express';

import * as config from '../../config.json';

export default function(_: Request, res: Response, next: NextFunction) {
    res.header("Access-Control-Allow-Origin", config.nuxt.base_url);
    res.header("Access-Control-Allow-Credentials", "true");
    next();
}