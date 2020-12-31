import {Request, Response, NextFunction} from 'express';

import * as config from '../../config.json';

export default function(_: Request, res: Response, next: NextFunction) {
    res.header("Access-Control-Allow-Origin", config.nuxt.baseURL);
    res.header("Access-Control-Allow-Credentials", "true");
    next();
}